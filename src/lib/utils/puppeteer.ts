import puppeteer, { type Browser, type LaunchOptions, type Page } from 'puppeteer';

/**
 * Chromium flags that keep a headless browser from taking down the container it shares
 * with the app server. Without these, Chromium can grow until the whole container is
 * starved of CPU / memory, which stalls the Node process serving every other request.
 */
const SAFE_CHROMIUM_ARGS = [
  '--no-sandbox', // Required.
  '--disable-setuid-sandbox',
  // Docker's /dev/shm is tiny; without this Chromium can hang or thrash.
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--mute-audio',
  '--no-first-run',
  '--renderer-process-limit=2',
  '--js-flags=--max-old-space-size=256',
];

/** Hard upper bound for a single page render, including navigation and screenshot. */
const DEFAULT_TASK_TIMEOUT_MS = 15_000;
/** Page-level timeouts fire this much earlier, so plain slowness fails without a kill. */
const PAGE_TIMEOUT_HEADROOM_MS = 3_000;
/** Upper bound for closing a page; a browser that can't close a page is wedged. */
const PAGE_CLOSE_TIMEOUT_MS = 2_000;
/** Renders waiting their turn (per lane) beyond this are rejected instead of piling up. */
const MAX_QUEUED_TASKS = 8;
/** Recycle the browser periodically so leaked memory in Chromium can't accumulate. */
const MAX_TASKS_PER_BROWSER = 100;

/**
 * Renders run one at a time per lane. Use the `leaf` lane for renders whose page never
 * triggers another render (e.g. the twemoji avatar), so that pages embedding them (share
 * images load `/api/twemoji-avatar.png`) don't deadlock waiting on themselves.
 */
export type PuppeteerLane = 'default' | 'leaf';

export class PuppeteerBusyError extends Error {
  constructor() {
    super('PuppeteerManager: too many renders queued');
  }
}

export class PuppeteerTimeoutError extends Error {
  constructor(ms: number) {
    super(`PuppeteerManager: render timed out after ${ms}ms`);
  }
}

const sleep = (ms: number) => new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), ms));

/**
 * Manages a singleton instance of a Puppeteer Browser, preserving
 * the last known launch configuration.
 *
 * Renders should go through `withPage`, which runs them one at a time per lane with a hard
 * timeout, and kills the browser if a render hangs, so a single bad render can't starve the
 * server.
 */
export class PuppeteerManager {
  static browser: Browser | undefined;
  static browserConfig: LaunchOptions | undefined;

  static #launching: Promise<Browser> | undefined;
  static #lanes: Record<PuppeteerLane, { queue: Promise<unknown>; queued: number }> = {
    default: { queue: Promise.resolve(), queued: 0 },
    leaf: { queue: Promise.resolve(), queued: 0 },
  };
  static #tasksOnBrowser = 0;

  /** Number of renders currently running or waiting, across lanes. */
  static get pending(): number {
    return this.#lanes.default.queued + this.#lanes.leaf.queued;
  }

  /**
   * Launch a Puppeteer Browser with the specified configuration. Subsequent calls to
   * launch() with no parameters, will return the previously launched
   * browser instance. If a subsequent call to launch() provides a configuration,
   * any existing browser instance will be closed and a new one created. Existing instances will
   * be relaunched with the same configuration if their underlying process dies.
   *
   * @param browserConfig {LaunchOptions} Puppeteer browser configuration.
   * @returns {Promise<Browser>} A browser instance.
   */
  static async launch(browserConfig?: LaunchOptions): Promise<Browser> {
    if (browserConfig) {
      this.browserConfig = browserConfig;
      await this.kill();
    }

    if (this.browser) return this.browser;
    if (this.#launching) return this.#launching;

    const launching = (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        ...this.browserConfig,
        args: [...new Set([...SAFE_CHROMIUM_ARGS, ...(this.browserConfig?.args ?? [])])],
      });

      browser.process()?.on('exit', () => {
        // eslint-disable-next-line no-console
        console.warn('PuppeteerManager: browser exited');
        // Only forget this browser if it's still the current one; a stale exit event
        // from a killed browser must not orphan a newer instance.
        if (this.browser === browser) this.browser = undefined;
      });

      this.browser = browser;
      this.#tasksOnBrowser = 0;
      return browser;
    })();

    this.#launching = launching;
    try {
      return await launching;
    } finally {
      if (this.#launching === launching) this.#launching = undefined;
    }
  }

  /**
   * Forcefully terminate the current browser (if any). The next `launch()` starts a fresh one.
   */
  static async kill(): Promise<void> {
    if (this.#launching) {
      await this.#launching.catch(() => undefined);
    }

    const browser = this.browser;
    this.browser = undefined;
    if (!browser) return;

    const childProcess = browser.process();
    await Promise.race([browser.close().catch(() => undefined), sleep(2_000)]);
    if (childProcess && childProcess.exitCode === null && childProcess.signalCode === null) {
      childProcess.kill('SIGKILL');
    }
  }

  /**
   * Run `task` against a fresh page. Renders run one at a time per lane; each is bounded by
   * `timeoutMs`, after which the browser is killed so a runaway render can't keep eating
   * the container. Throws `PuppeteerBusyError` if too many renders are already queued.
   */
  static withPage<T>(
    task: (page: Page) => Promise<T>,
    {
      timeoutMs = DEFAULT_TASK_TIMEOUT_MS,
      lane = 'default',
    }: { timeoutMs?: number; lane?: PuppeteerLane } = {},
  ): Promise<T> {
    const l = this.#lanes[lane];
    if (l.queued >= MAX_QUEUED_TASKS) {
      return Promise.reject(new PuppeteerBusyError());
    }

    l.queued++;
    const run = l.queue.then(() => this.#runTask(task, timeoutMs));
    l.queue = run
      .catch(() => undefined)
      .finally(() => {
        l.queued--;
      });
    return run;
  }

  static async #closePage(page: Page): Promise<void> {
    const result = await Promise.race([
      page.close().catch(() => undefined),
      sleep(PAGE_CLOSE_TIMEOUT_MS),
    ]);
    if (result === 'timeout') {
      // eslint-disable-next-line no-console
      console.error('PuppeteerManager: page did not close in time, killing browser');
      await this.kill();
    }
  }

  static async #runTask<T>(task: (page: Page) => Promise<T>, timeoutMs: number): Promise<T> {
    if (this.browser && this.#tasksOnBrowser >= MAX_TASKS_PER_BROWSER) {
      await this.kill();
    }

    let page: Page | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        reject(new PuppeteerTimeoutError(timeoutMs));
      }, timeoutMs);
    });

    const work = (async () => {
      const browser = await this.launch();
      if (timedOut) throw new PuppeteerTimeoutError(timeoutMs);
      this.#tasksOnBrowser++;
      const newPage = await browser.newPage();
      if (timedOut) {
        // the render was abandoned while we were opening the page; don't leak it
        await this.#closePage(newPage);
        throw new PuppeteerTimeoutError(timeoutMs);
      }
      page = newPage;
      const pageTimeout = Math.max(timeoutMs - PAGE_TIMEOUT_HEADROOM_MS, 1_000);
      page.setDefaultTimeout(pageTimeout);
      page.setDefaultNavigationTimeout(pageTimeout);
      return task(page);
    })();
    // avoid an unhandled rejection if the timeout wins the race
    work.catch(() => undefined);

    try {
      return await Promise.race([work, timeout]);
    } catch (e) {
      if (timedOut) {
        // eslint-disable-next-line no-console
        console.error('PuppeteerManager: render timed out, killing browser');
        page = undefined;
        await this.kill();
      }
      throw e;
    } finally {
      clearTimeout(timer);
      if (page) await this.#closePage(page);
    }
  }
}

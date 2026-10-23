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
  '--renderer-process-limit=1',
  '--js-flags=--max-old-space-size=256',
];

/** Hard upper bound for a single page render, including navigation and screenshot. */
const DEFAULT_TASK_TIMEOUT_MS = 15_000;
/** Renders waiting their turn beyond this are rejected instead of piling up. */
const MAX_QUEUED_TASKS = 8;
/** Recycle the browser periodically so leaked memory in Chromium can't accumulate. */
const MAX_TASKS_PER_BROWSER = 100;

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

/**
 * Manages a singleton instance of a Puppeteer Browser, preserving
 * the last known launch configuration.
 *
 * Renders should go through `withPage`, which runs them one at a time with a hard timeout,
 * and kills the browser if a render hangs, so a single bad render can't starve the server.
 */
export class PuppeteerManager {
  static browser: Browser | undefined;
  static browserConfig: LaunchOptions | undefined;

  static #queue: Promise<unknown> = Promise.resolve();
  static #queued = 0;
  static #tasksOnBrowser = 0;

  static #onBrowserExit = () => {
    // eslint-disable-next-line no-console
    console.warn('PuppeteerManager: browser exited');
    // if the browser process exits for any reason, mark the browser as dead
    // so that we can perform re-launch on the next call to this.launch
    this.browser = undefined;
  };

  /** Number of renders currently running or waiting. */
  static get pending(): number {
    return this.#queued;
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
    if (browserConfig && this.browser) {
      await this.kill();
    }

    if (!this.browser) {
      this.browserConfig =
        this.browserConfig && !browserConfig ? this.browserConfig : browserConfig;
      const browser = await puppeteer.launch({
        headless: true,
        ...this.browserConfig,
        args: [...new Set([...SAFE_CHROMIUM_ARGS, ...(this.browserConfig?.args ?? [])])],
      });

      const childProcess = browser.process();
      childProcess?.on('exit', this.#onBrowserExit);
      this.browser = browser;
      this.#tasksOnBrowser = 0;
    }

    return this.browser;
  }

  /**
   * Forcefully terminate the current browser (if any). The next `launch()` starts a fresh one.
   */
  static async kill(): Promise<void> {
    const browser = this.browser;
    this.browser = undefined;
    if (!browser) return;

    const childProcess = browser.process();
    try {
      await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 2_000))]);
    } catch {
      // ignore, we SIGKILL below
    }
    if (childProcess && childProcess.exitCode === null && !childProcess.killed) {
      childProcess.kill('SIGKILL');
    }
  }

  /**
   * Run `task` against a fresh page. Renders run one at a time; each is bounded by
   * `timeoutMs`, after which the browser is killed so a runaway render can't keep eating
   * the container. Throws `PuppeteerBusyError` if too many renders are already queued.
   */
  static withPage<T>(
    task: (page: Page) => Promise<T>,
    { timeoutMs = DEFAULT_TASK_TIMEOUT_MS }: { timeoutMs?: number } = {},
  ): Promise<T> {
    if (this.#queued >= MAX_QUEUED_TASKS) {
      return Promise.reject(new PuppeteerBusyError());
    }

    this.#queued++;
    const run = this.#queue.then(() => this.#runTask(task, timeoutMs));
    this.#queue = run
      .catch(() => undefined)
      .finally(() => {
        this.#queued--;
      });
    return run;
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
      this.#tasksOnBrowser++;
      page = await browser.newPage();
      page.setDefaultTimeout(timeoutMs);
      page.setDefaultNavigationTimeout(timeoutMs);
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
      await page?.close().catch(() => undefined);
    }
  }
}

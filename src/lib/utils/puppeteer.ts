import puppeteer, {
  type Page,
  type Browser,
  type PuppeteerNodeLaunchOptions,
  type Viewport,
} from 'puppeteer';
// import { Deferred } from 'puppeteer-core';

// class PagePool {
//   pool: Map<Page, boolean> | undefined;
// }

/**
 * Manages a singleton instance of a Puppeteer Browser and/or Page, preserving
 * the last known launch and viewport configuration.
 */
export class PuppeteerManager {
  static browser: Browser | undefined;
  static browserOptions: PuppeteerNodeLaunchOptions | undefined;
  static page: Page | undefined;
  static pageViewport: Viewport | undefined;

  static maxPages: number = 1;
  static pageTasks: Function[] = [];
  static pagePool: Page[] | undefined;
  // static pagePool: Map<Page, boolean> | undefined;
  // static rentedPages: Page[] = [];
  static pagePoolLoading: boolean = false;

  static #onBrowserExit = () => {
    // eslint-disable-next-line no-console
    console.warn('PuppeteerManager: browser exited');
    // if the browser process exits for any reason, mark the browser as dead
    // so that we can perform re-launch on the next call to this.launch
    this.browser = undefined;
    this.page = undefined;
    this.pagePool = undefined;
  };

  /**
   * Launch a Puppeteer Browser with the specified configuration. Subsequent calls to
   * launch() with no parameters, will return the previously launched
   * browser instance. If a subsequent call to launch() provides a configuration,
   * any existing browser instance will be closed and a new one created. Existing instances will
   * be relaunched with the same configuration if their underlying process dies.
   *
   * @param browserOptions {PuppeteerNodeLaunchOptions} Puppeteer browser configuration.
   * @returns {Promise<Browser>} A browser instance.
   */
  static async launch(browserOptions?: PuppeteerNodeLaunchOptions): Promise<Browser> {
    if (browserOptions && this.browser) {
      await this.browser.close();
    }

    if (!this.browser) {
      this.browserOptions =
        this.browserOptions && !browserOptions ? this.browserOptions : browserOptions;
      this.browser = await puppeteer.launch(this.browserOptions);

      const childProcess = this.browser.process();
      childProcess?.on('exit', this.#onBrowserExit);
    }

    return this.browser;
  }

  /**
   * Create a Puppeteer Page within a Brower configured by the given options and whose viewport
   * is specified by the provided viewport options. The browser and page will be reused on subsequent
   * calls unless their respective configurations are re-specified.
   *
   * @param browserOptions {PuppeteerNodeLaunchOptions} Puppeteer browser configuration.
   * @param pageViewport {Viewport} Puppeteer page viewport configuration
   * @returns {Promise<Page>} A browser instance.
   */
  static async launchPage(
    browserOptions?: PuppeteerNodeLaunchOptions,
    pageViewport?: Viewport,
  ): Promise<Page> {
    const browser = await this.launch(browserOptions);
    if (pageViewport && this.page) {
      await this.page.close();
      this.page = undefined;
    }

    if (!this.page) {
      this.page = await browser.newPage();
      this.pageViewport = this.pageViewport && !pageViewport ? this.pageViewport : pageViewport;
      // setViewport wants null
      await this.page.setViewport(this.pageViewport ?? null);
    }

    return this.page;
  }

  static async prepare(
    browserOptions?: PuppeteerNodeLaunchOptions,
    pageViewport?: Viewport,
  ): Promise<void> {
    console.log('Preparing pages...')
    if (this.pagePoolLoading) {
      return
    }

    this.pagePoolLoading = true
    const browser = await this.launch(browserOptions);

    this.pagePool = [];
    const pageSetups = [];
    let i = this.maxPages;
    while (i--) {
      pageSetups.push(
        browser.newPage().then((page) => {
          this.pagePool.push(page);
          // this.pagePool?.set(page, false)
          page.on('error', (error) => {
            console.log('page error', error)
          })
          page.on('pageerror', (error) => {
            console.log('page pageerror', error)
          })
          page.on('close', (error) => {
            console.log('page close', error)
          })
          console.log('page created');
          return page.setViewport(pageViewport ?? null);
        }),
      );
    }

    return Promise.all(pageSetups).then(() => {
      this.pagePoolLoading = false
      console.log('pages created!', this.pagePool?.length);
    });
  }

  static async processQueue() {
    const page = this.pagePool?.shift()
    if (!page) {
      console.debug('No pages available')
      return
    }

    // await worker.load()

    const task = this.pageTasks.shift()
    if (!task) {
      console.debug('No task to be done, pages available')
      this.pagePool?.push(page)
      return
    }

    console.debug('Executing')
    task(page)
      .then(() => {
        console.log('returning page')
        this.pagePool?.push(page)
        this.processQueue()
      })

    setTimeout(() => { this.processQueue() }, 0)
  }

  static async rentPage<T>(callback: (page: Page) => T) {
    this.pageTasks.push(callback)
    this.processQueue()
  }
}


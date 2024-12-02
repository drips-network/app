import puppeteer, { type Browser, type PuppeteerNodeLaunchOptions } from 'puppeteer';

/**
 * Manages a singleton instance of a Puppeteer Browser, preserving
 * the last known launch configuration.
 */
export class PuppeteerManager {
  static browser: Browser | undefined;
  static browserConfig: PuppeteerNodeLaunchOptions | undefined;

  static #onBrowserExit = () => {
    // eslint-disable-next-line no-console
    console.warn('PuppeteerManager: browser exited');
    // if the browser process exits for any reason, mark the browser as dead
    // so that we can perform re-launch on the next call to this.launch
    this.browser = undefined;
  };

  /**
   * Launch a Puppeteer Browser with the specified configuration. Subsequent calls to
   * launch() with no parameters, will return the previously launched
   * browser instance. If a subsequent call to launch() provides a configuration,
   * any existing browser instance will be closed and a new one created. Existing instances will
   * be relaunched with the same configuration if their underlying process dies.
   *
   * @param browserConfig {PuppeteerNodeLaunchOptions} Puppeteer browser configuration.
   * @returns {Promise<Browser>} A browser instance.
   */
  static async launch(browserConfig?: PuppeteerNodeLaunchOptions): Promise<Browser> {
    if (browserConfig && this.browser) {
      await this.browser.close();
    }

    if (!this.browser) {
      this.browserConfig =
        this.browserConfig && !browserConfig ? this.browserConfig : browserConfig;
      this.browser = await puppeteer.launch(this.browserConfig);

      const childProcess = this.browser.process();
      childProcess?.on('exit', this.#onBrowserExit);
    }

    return this.browser;
  }
}

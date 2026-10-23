import { PuppeteerBusyError, PuppeteerManager, PuppeteerTimeoutError } from '$lib/utils/puppeteer';
import { error, isHttpError } from '@sveltejs/kit';

export default async (imageUrl: string, scaleFactor = 1) => {
  try {
    // Runs serialized, with a hard timeout, killing Chromium if it hangs. See PuppeteerManager.
    return await PuppeteerManager.withPage(async (page) => {
      await page.setViewport({
        width: 640,
        height: 480,
        deviceScaleFactor: scaleFactor,
      });

      // Navigate to the page rendering the button
      const [rsp] = await Promise.all([page.waitForNavigation(), page.goto(imageUrl)]);

      if (!rsp || rsp?.status() === 404) {
        throw error(404);
      }

      // Get the button
      const selector = '#content';
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      // if there's no element for any reason, that's
      // very unexpected and we're toast
      if (!element) {
        return error(500);
      }

      return await element.screenshot({ omitBackground: true });
    });
  } catch (e) {
    if (isHttpError(e)) throw e;
    if (e instanceof PuppeteerBusyError || e instanceof PuppeteerTimeoutError) {
      throw error(503);
    }
    throw e;
  }
};

import { PuppeteerManager } from '$lib/utils/puppeteer';
import { error } from '@sveltejs/kit';

export default async (imageUrl: string, scaleFactor = 1) => {
  let page;
  try {
    // see hooks.server.ts for configuration details
    const browser = await PuppeteerManager.launch();

    // Set up the page
    page = await browser.newPage();
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

    const imageBuffer = await element.screenshot({ omitBackground: true });
    return imageBuffer;
  } finally {
    page?.close();
  }
};

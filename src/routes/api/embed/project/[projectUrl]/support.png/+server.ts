import type { RequestHandler, RouteParams } from './$types';
import { error } from '@sveltejs/kit';
import { redis } from '$lib/../routes/api/redis';
import {
  getSupportButtonOptions,
  SupportButtonStat,
  SupportButtonText,
  type SupportButtonOptions,
} from '$lib/components/project-support-button/project-support-button';
import network from '$lib/stores/wallet/network';
import { PuppeteerManager } from '$lib/utils/puppeteer';

const REPLACE_PNG_REGEX = /(\.png\/?)(\?.*|$)/;
const CACHE_KEY_PREFIX = 'support-button-v3';

const getCacheExpiration = (options: SupportButtonOptions): number => {
  // Cache dynamic data for 6 hours
  if (options.stat !== SupportButtonStat.none) {
    return 60 * 60 * 6;
  }

  return Infinity;
};

const getCacheKey = (options: SupportButtonOptions, params: RouteParams): string => {
  // buttons without project details and $ support or dependencies can be cached
  // for all projects to use.
  let key = `${CACHE_KEY_PREFIX}-${network.name}-${options.style}-${options.background}-${options.text}`;
  if (options.text === SupportButtonText.project) {
    key += `-${encodeURIComponent(params.projectUrl)}`;
  }

  // AND the button will only be cached for 6 hours
  if (options.stat !== SupportButtonStat.none) {
    key += `-${options.stat}`;
  }

  return key;
};

const getMetaCacheKey = (cacheKey: string) => {
  return cacheKey + '-meta';
};

const cacheImageBuffer = (cacheKey: string, imageBuffer: Uint8Array) => {
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  return Promise.all([
    redis?.set(cacheKey, imageBase64),
    redis?.hSet(getMetaCacheKey(cacheKey), 'updatedAt', Date.now()),
  ]);
};

const captureScreenshot = async (imageUrl: string) => {
  let page;
  try {
    // see hooks.server.ts for configuration details
    const browser = await PuppeteerManager.launch();

    // Set up the page
    page = await browser.newPage();
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 2,
    });

    // Navigate to the page rendering the button
    await page.goto(imageUrl);

    // Get the button
    const selector = '.support-button';
    const element = await page.waitForSelector(selector);
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

const updateCachedImageBuffer = async (
  cacheKey: string,
  buttonOptions: SupportButtonOptions,
  imageUrl: string,
) => {
  const result = await redis?.hGet(getMetaCacheKey(cacheKey), 'updatedAt');
  const now = Date.now();
  const then = parseInt(result || '0', 10);

  const cacheExpiration = getCacheExpiration(buttonOptions);
  if (cacheExpiration === Infinity) {
    return;
  }

  if (now - then < cacheExpiration * 1000) {
    return;
  }

  const imageBuffer = await captureScreenshot(imageUrl);
  cacheImageBuffer(cacheKey, imageBuffer);
};

export const GET: RequestHandler = async ({ url, params }) => {
  // drips.network/embed/project.png/support.png/?background=dark
  // ==> drips.network/embed/project.png/support?background=dark
  const imageUrl = url.href.replace(REPLACE_PNG_REGEX, '$2');
  // the URL should always be re-written
  if (imageUrl === url.href) {
    return error(400);
  }

  const buttonOptions = getSupportButtonOptions(url);
  // Try to fetch the pre-rendered image from cache
  const cacheKey = getCacheKey(buttonOptions, params);
  const cachedImageBase64 = redis && (await redis.get(cacheKey));
  if (cachedImageBase64) {
    updateCachedImageBuffer(cacheKey, buttonOptions, imageUrl);
    const cachedImageBuffer = Buffer.from(cachedImageBase64, 'base64');
    return new Response(cachedImageBuffer, {
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png' }),
    });
  }

  // Take a screenshot of the button
  const imageBuffer = await captureScreenshot(imageUrl);
  // Cache the result
  cacheImageBuffer(cacheKey, imageBuffer);

  return new Response(imageBuffer, {
    status: 200,
    headers: new Headers({ 'Content-Type': 'image/png' }),
  });
};

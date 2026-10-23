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
import { PuppeteerBusyError, PuppeteerManager, PuppeteerTimeoutError } from '$lib/utils/puppeteer';

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

const captureScreenshot = (imageUrl: string) =>
  // Runs serialized, with a hard timeout, killing Chromium if it hangs. See PuppeteerManager.
  PuppeteerManager.withPage(async (page) => {
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

    return await element.screenshot({ omitBackground: true });
  });

const refreshesInFlight = new Set<string>();

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

  // Background refreshes are best-effort: never stack them up behind other renders.
  if (refreshesInFlight.has(cacheKey) || PuppeteerManager.pending > 0) {
    return;
  }

  refreshesInFlight.add(cacheKey);
  try {
    const imageBuffer = await captureScreenshot(imageUrl);
    await cacheImageBuffer(cacheKey, imageBuffer);
  } finally {
    refreshesInFlight.delete(cacheKey);
  }
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
    updateCachedImageBuffer(cacheKey, buttonOptions, imageUrl).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh cached support button', e);
    });
    const cachedImageBuffer = Buffer.from(cachedImageBase64, 'base64');
    return new Response(cachedImageBuffer, {
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png' }),
    });
  }

  // Take a screenshot of the button
  let imageBuffer: Uint8Array;
  try {
    imageBuffer = await captureScreenshot(imageUrl);
  } catch (e) {
    if (e instanceof PuppeteerBusyError || e instanceof PuppeteerTimeoutError) {
      return error(503);
    }
    throw e;
  }
  // Cache the result
  cacheImageBuffer(cacheKey, imageBuffer).catch(() => undefined);

  return new Response(imageBuffer as BodyInit, {
    status: 200,
    headers: new Headers({ 'Content-Type': 'image/png' }),
  });
};

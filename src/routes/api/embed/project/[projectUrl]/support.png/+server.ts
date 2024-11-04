import type { RequestHandler, RouteParams } from './$types';
import { error } from '@sveltejs/kit';
import puppeteer from 'puppeteer';
import { redis } from '$lib/../routes/api/redis';
import {
  getSupportButtonOptions,
  SupportButtonStat,
  SupportButtonText,
  type SupportButtonOptions,
} from '$lib/components/project-support-button/project-support-button';
import network from '$lib/stores/wallet/network';

const REPLACE_PNG_REGEX = /(\.png\/?)(\?.*|$)/;
const CACHE_KEY_PREFIX = 'support-button';

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

export const GET: RequestHandler = async ({ url, params }) => {
  let browser;
  try {
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
    // TODO: re-add
    // const cachedImageBase64 = redis && (await redis.get(cacheKey));
    // if (cachedImageBase64) {
    //   const cachedImageBuffer = Buffer.from(cachedImageBase64, 'base64');
    //   return new Response(cachedImageBuffer, {
    //     status: 200,
    //     headers: new Headers({ 'Content-Type': 'image/png' }),
    //   });
    // }

    browser = await puppeteer.launch({
      // Dockerfile deployment requires different executablePath
      ...(process.env.NODE_ENV === 'production' && {
        executablePath: '/usr/bin/google-chrome-stable',
      }),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    });

    // Set up the page
    const page = await browser.newPage();
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 2,
    });

    // Navigate to the page rendering the button
    await page.goto(imageUrl);
    // await page.goto(imageUrl, { waitUntil: 'domcontentloaded' });
    // Wait until all images and fonts have loaded
    // await page.evaluate(async () => {
    //   const selectors = Array.from(document.querySelectorAll('img'));
    //   await Promise.all([
    //     document.fonts.ready,
    //     ...selectors.map((img) => {
    //       // Image has already finished loading, let’s see if it worked
    //       if (img.complete) {
    //         // Image loaded and has presence
    //         if (img.naturalHeight !== 0) return;
    //         // Image failed, so it has no height
    //         throw new Error('Image failed to load');
    //       }
    //       // Image hasn’t loaded yet, added an event listener to know when it does
    //       return new Promise((resolve, reject) => {
    //         img.addEventListener('load', resolve);
    //         img.addEventListener('error', reject);
    //       });
    //     }),
    //   ]);
    // });

    const selector = '.support-button';
    const element = await page.waitForSelector(selector);
    // if there's no element for any reason, that's
    // very unexpected and we're toast
    if (!element) {
      return error(500);
    }

    // Take a screenshot of the button
    const imageBuffer = await element.screenshot({ omitBackground: true });
    // Cache the result
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const cacheExpiration = getCacheExpiration(buttonOptions);
    redis?.set(cacheKey, imageBase64, {
      ...(cacheExpiration !== Infinity && { EX: cacheExpiration }),
    });

    return new Response(imageBuffer, {
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png' }),
    });
  } finally {
    browser?.close();
  }
};

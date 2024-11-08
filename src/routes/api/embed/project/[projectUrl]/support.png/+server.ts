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

export const GET: RequestHandler = async ({ url, params }) => {
  // let page, pageReturner
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
    const cachedImageBase64 = redis && (await redis.get(cacheKey));
    if (cachedImageBase64) {
      const cachedImageBuffer = Buffer.from(cachedImageBase64, 'base64');
      return new Response(cachedImageBuffer, {
        status: 200,
        headers: new Headers({ 'Content-Type': 'image/png' }),
      });
    }

    // see hooks.server.ts for configuration details
    // const page = await PuppeteerManager.launchPage()
    // [page, pageReturner] = await PuppeteerManager.rentPage()
    // console.log('page got', page)

    // // Navigate to the page rendering the button
    // await page.goto(imageUrl);

    // // Get the button
    // const selector = '.support-button';
    // const element = await page.waitForSelector(selector);
    // // if there's no element for any reason, that's
    // // very unexpected and we're toast
    // if (!element) {
    //   return error(500);
    // }

    // // Take a screenshot of the button
    // const imageBuffer = await element.screenshot({ omitBackground: true });
    // console.log('imageBuffer')

    // // Take a screenshot of the button
    // const imageBuffer = await element.screenshot({ omitBackground: true });
    const imageBuffer = await new Promise((resolve) => {
      PuppeteerManager.rentPage(async (page) => {
        console.time(imageUrl)
        // Navigate to the page rendering the button
        console.log('going to', imageUrl);
        await page.goto(imageUrl);

        // Get the button
        const selector = '.support-button';
        console.log('waitForSelector');
        const element = await page.waitForSelector(selector);
        // if there's no element for any reason, that's
        // very unexpected and we're toast
        if (!element) {
          return error(500);
        }

        console.log('screenshot');
        // Take a screenshot of the button
        const imageBuffer = await element.screenshot({ omitBackground: true });
        // return imageBuffer
        resolve(imageBuffer)
      })
    })
    // const imageBuffer = PuppeteerManager.rentPage(async (page) => {
    //   // Navigate to the page rendering the button
    //   await page.goto(imageUrl);

    //   // Get the button
    //   const selector = '.support-button';
    //   const element = await page.waitForSelector(selector);
    //   // if there's no element for any reason, that's
    //   // very unexpected and we're toast
    //   if (!element) {
    //     return error(500);
    //   }

    //   // Take a screenshot of the button
    //   const imageBuffer = await element.screenshot({ omitBackground: true });
    //   return imageBuffer
    // })

    // Cache the result
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const cacheExpiration = getCacheExpiration(buttonOptions);
    redis?.set(cacheKey, imageBase64, {
      ...(cacheExpiration !== Infinity && { EX: cacheExpiration }),
    });

    // console.log('page returned')
    // pageReturner(page)
    console.timeEnd(imageUrl)
    return new Response(imageBuffer, {
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png' }),
    });
  } finally {
    // if(pageReturner) {
    //   pageReturner(page)
    // }
    // pageReturner(page)
  }
};

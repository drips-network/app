import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import puppeteer from 'puppeteer';

const REPLACE_PNG_REGEX = /(\.png\/?)(\?.*|$)/;

export const GET: RequestHandler = async ({ url }) => {
  // drips.network/embed/project.png/support.png/?background=dark
  // ==> drips.network/embed/project.png/support?background=dark
  const imageUrl = url.href.replace(REPLACE_PNG_REGEX, '$2');
  // TODO: handle invalid href

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(imageUrl);
  const selector = '.embed-badge';
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  // if there's no element for any reason, that's
  // very unexpected and we're toast
  if (!element) {
    return error(500);
  }
  const imageBuffer = await element.screenshot({ omitBackground: true });

  return new Response(imageBuffer, {
    status: 200,
    headers: new Headers({ 'Content-Type': 'image/png' }),
  });
};

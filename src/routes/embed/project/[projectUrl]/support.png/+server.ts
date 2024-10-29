import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import puppeteer from 'puppeteer';

const REPLACE_PNG_REGEX = /(\.png\/?)(\?.*|$)/;

export const GET: RequestHandler = async ({ url }) => {
  // drips.network/embed/project.png/support.png/?background=dark
  // ==> drips.network/embed/project.png/support?background=dark
  const imageUrl = url.href.replace(REPLACE_PNG_REGEX, '$2');
  // the URL should always be re-written
  if (imageUrl === url.href) {
    return error(400);
  }

  const browser = await puppeteer.launch({
    // Dockerfile deployment requires different executablePath
    ...(process.env.NODE_ENV === 'production' && {
      executablePath: '/usr/bin/google-chrome-stable',
    }),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Set up the page
  const page = await browser.newPage();
  await page.setViewport({
    width: 640,
    height: 480,
    deviceScaleFactor: 2,
  });
  // Remove transition of body, html, and main elements
  page.on('load', () => {
    const content = `
      *,
      *::after,
      *::before {
          transition-delay: 0s !important;
          transition-duration: 0s !important;
          animation-delay: -0.0001s !important;
          animation-duration: 0s !important;
          animation-play-state: paused !important;
          caret-color: transparent !important;
      }`;

    page.addStyleTag({ content });
  });

  // Navigate to the page rendering the button
  await page.goto(imageUrl);
  const selector = '.support-button';
  const element = await page.waitForSelector(selector, { visible: true });
  // if there's no element for any reason, that's
  // very unexpected and we're toast
  if (!element) {
    return error(500);
  }

  // Take a screenshot of the button
  const imageBuffer = await element.screenshot({ omitBackground: true });
  return new Response(imageBuffer, {
    status: 200,
    headers: new Headers({ 'Content-Type': 'image/png' }),
  });
};

import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import nodeHtmlToImage from 'node-html-to-image';
import loadImage from '../loadImage';
import baseStyles from '../baseStyles';
import getContrastColor from '$lib/utils/get-contrast-text-color';

export const GET: RequestHandler = async ({ url }) => {
  const projectNameParam = url.searchParams.get('projectName');
  const projectEmojiParam = url.searchParams.get('emoji');
  const dependenciesCountParam = url.searchParams.get('dependenciesCount');
  const bgColorParam = url.searchParams.get('bgColor');
  const target = url.searchParams.get('target');

  try {
    assert(projectNameParam && projectEmojiParam && dependenciesCountParam && bgColorParam);
    assert(target === 'twitter' || target === 'og');
  } catch (e) {
    throw error(400, 'Invalid query params missing');
  }

  const height = target === 'twitter' ? 600 : 675;

  const bgColor = bgColorParam === 'none' ? '#5555FF' : bgColorParam;
  const contrastColor = getContrastColor(bgColor);

  const bgTheme = contrastColor === 'black' ? 'dark' : 'light';
  const bgDataURI = loadImage(`./static/assets/share/bg-${target}-${bgTheme}.png`);
  const boxIconDataURI = loadImage(`./static/assets/share/box-${bgTheme}.png`);

  const textColor = contrastColor === 'black' ? '#333333' : '#FFFFFF';

  const image = await nodeHtmlToImage({
    html: `
    <html>
      <head>
        ${baseStyles(height, bgColor)}
      </head>
      <body>
        <div style="font-family: Redaction; color: ${textColor};">
          <img src="${bgDataURI}">
          <div style="position: fixed; width: 80%; left: 36px; bottom: 36px; display: flex; flex-direction: column; gap: 24px">
            <span style="font-family: Inter; font-size: 40px">Project</span>
            <span style="font-size: 90px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${projectNameParam}</span>
            <div style="display: flex; gap: 24px; align-items: center; opacity: ${
              dependenciesCountParam === '0' ? '0' : '1'
            }">
              <img src="${boxIconDataURI}" />
              <span style="font-family: Inter; font-size: 40px;>${dependenciesCountParam} Dependencies</span>
            </div>
          </div>
        </div>
      </body>
    </html>`,
  });

  let item: Buffer | string;
  if (Array.isArray(image)) {
    item = image[0];
  } else {
    item = image;
  }

  let imgRes: Buffer;
  if (Buffer.isBuffer(item)) {
    imgRes = item;
  } else {
    imgRes = Buffer.from(item);
  }

  return new Response(imgRes, {
    headers: { 'Content-Type': 'image/png' },
  });
};

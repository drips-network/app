import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import nodeHtmlToImage from 'node-html-to-image';
import loadImage from '../loadImage';
import baseStyles from '../baseStyles';

export const GET: RequestHandler = async ({ url }) => {
  const listName = url.searchParams.get('listName');
  const recipientsCount = url.searchParams.get('recipientsCount');
  const target = url.searchParams.get('target');

  try {
    assert(listName && recipientsCount);
    assert(target === 'twitter' || target === 'og');
  } catch (e) {
    throw error(400, 'Invalid query params missing');
  }

  const height = target === 'twitter' ? 600 : 675;

  const bgDataURI = await loadImage(`/assets/share/bg-${target}-light.png`, fetch);
  const dripListIconDataURI = await loadImage('/assets/share/dripList.png', fetch);

  const recipientsString = recipientsCount === '1' ? 'Recipient' : 'Recipients';

  const image = await nodeHtmlToImage({
    html: `
    <html>
      <head>
        ${await baseStyles(height, '#5555FF', fetch)}
      </head>
      <body>
        <div style="font-family: Redaction; color: white;">
          <img src="${bgDataURI}">
          <div style="position: fixed; width: 80%; left: 36px; bottom: 36px; display: flex; flex-direction: column; gap: 24px">
            <span style="font-family: Inter; font-size: 40px">Drip List</span>
            <span style="font-size: 90px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${listName}</span>
            <div style="display: flex; gap: 24px; align-items: center">
              <img src="${dripListIconDataURI}" />
              <span style="font-family: Inter; font-size: 40px">${recipientsCount} ${recipientsString}</span>
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

import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import loadImage from '../loadImage';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../loadFonts';

export const GET: RequestHandler = async ({ url, fetch }) => {
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

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: #5555FF;">
      <!--<img src="${bgDataURI}" />-->
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: white; gap: 24px;">
         <span style="font-family: Inter; font-size: 40px">Drip List</span>
         <span style="font-family: Redaction; font-size: 90px; display: block; line-clamp: 2;">${listName}</span>
         <div style="display: flex; gap: 24px; align-items: center">
           <img src="${dripListIconDataURI}" height="64px" width="64px" />
           <span style="font-family: Inter; font-size: 40px">${recipientsCount} ${recipientsString}</span>
         </div>
       </div>
    </div>`),
    {
      width: 1200,
      height: height,
      fonts: await loadFonts(fetch),
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const image = resvg.render();

  return new Response(image.asPng(), {
    headers: {
      'content-type': 'image/png',
    },
  });
};

import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import loadImage from '../loadImage';
import getContrastColor from '$lib/utils/get-contrast-text-color';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../loadFonts';
import { Resvg } from '@resvg/resvg-js';
import getBackgroundImage from '../getBackgroundImage';
import twemoji from 'twemoji';

export const GET: RequestHandler = async ({ url, fetch }) => {
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
  const bgDataURI = await loadImage(`/assets/share/bg-${target}-${bgTheme}.png`, fetch);
  const boxIconDataURI = await loadImage(`/assets/share/box-${bgTheme}.png`, fetch);

  const textColor = contrastColor === 'black' ? '#333333' : '#FFFFFF';

  const dependenciesString = dependenciesCountParam === '1' ? 'Dependency' : 'Dependencies';

  const twemojiElem = twemoji.parse(projectEmojiParam);
  const twemojiSrc = /<img[^>]+src="(https:\/\/[^">]+)"/g.exec(twemojiElem)?.[1];

  assert(twemojiSrc);

  const twemojiImg = await loadImage(twemojiSrc, fetch);

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: ${bgColor}">
      <!--<img src="${bgDataURI}" />-->
      ${getBackgroundImage(bgColor, textColor, target)}
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: ${textColor}; gap: 24px;">
        <span style="font-family: Inter; font-size: 40px">Project</span>
        <div style="display: flex; gap: 32px;">
          <div style="display: flex; margin-top: 16px; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white;">
            <img height="64px" width="64px" src="${twemojiImg}" />
          </div>
          <span style="font-family: Redaction; font-size: 90px; display: block; line-clamp: 2;">${projectNameParam}</span>
        </div>
        <div style="display: flex; gap: 24px; align-items: center">
          <img src="${boxIconDataURI}" height="64px" width="64px" />
          <span style="font-family: Inter; font-size: 40px">${dependenciesCountParam} ${dependenciesString}</span>
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

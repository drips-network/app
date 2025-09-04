import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import getContrastColor from '$lib/utils/get-contrast-text-color';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../../loadFonts';
import { Resvg } from '@resvg/resvg-js';
import getBackgroundImage from '../../getBackgroundImage';
import twemoji from '$lib/utils/twemoji';
import { getRound } from '$lib/utils/rpgf/rpgf';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
  const { roundSlug } = params;

  const round = await getRound(fetch, roundSlug);
  if (!round) {
    return error(404, 'Round not found');
  }
 
  const { emoji, customAvatarCid, color, name } = round;

  const target = url.searchParams.get('target');

  try {
    assert(target === 'twitter' || target === 'og');
  } catch {
    error(400, 'Invalid or missing query params');
  }

  const height = target === 'twitter' ? 600 : 675;
  const contrastColor = getContrastColor(color);

  const textColor = contrastColor === 'black' ? '#333333' : '#FFFFFF';

  const twemojiElem = (emoji !== 'none' && twemoji(emoji)) ?? undefined;
  const twemojiSrc = (twemojiElem && /src\s*=\s*"(.+?)"/g.exec(twemojiElem)?.[1]) ?? undefined;

  const twemojiImg = twemojiSrc && (await (await fetch(twemojiSrc)).text());

  const resizedTwemojImg =
    typeof twemojiImg === 'string'
      ? twemojiImg.replace('<svg', '<svg height="60%" width="60%"')
      : '';

  const avatarHtml = customAvatarCid
    ? `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white; ">
        <img height="100%" width="100%" src="https://drips.network/api/custom-avatars/${customAvatarCid}" style="border-radius: 50%; border: 1px solid black" />
      </div>`
    : `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white;">
          ${resizedTwemojImg}
        </div>`;

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: ${color}">
      ${getBackgroundImage(color, textColor, target)}
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: ${textColor}; gap: 24px;">
        <span style="font-family: Inter; font-size: 40px">RetroPGF round</span>
        <div style="display: flex; gap: 32px;">
        ${avatarHtml}
          <span style="font-family: Redaction; width: 1000px; font-size: 90px; display: block; line-clamp: 2;">${name}</span>
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
      'cache-control': 'public, max-age=86400', // 24 hours
    },
  });
};

import renderScreenshot from '../../shared/render-screenshot.js';

export const GET = async ({ url }) => {
  const emoji = decodeURIComponent(url.searchParams.get('emoji') ?? '');
  const bgColor = decodeURIComponent(url.searchParams.get('bgColor') ?? '');
  const imageUrl = `${url.origin}/api/twemoji-avatar?emoji=${emoji}&bgColor=${bgColor}`;

  // Leaf lane: share-image renders embed this avatar, so it must not queue behind them.
  const imageBuffer = await renderScreenshot(imageUrl, 1, 'leaf');

  return new Response(imageBuffer as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};

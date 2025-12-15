import renderScreenshot from '../../../../shared/render-screenshot.js';

export const GET = async ({ url }) => {
  const imageUrl = url.href.replace('.png', '');
  const imageBuffer = await renderScreenshot(imageUrl);

  return new Response(imageBuffer as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};

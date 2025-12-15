import renderScreenshot from '../../../../shared/render-screenshot.js';

export const GET = async ({ params, url }) => {
  const { type, id } = params;

  const imageUrl = `${url.origin}/api/share-images-new/${type}/${encodeURIComponent(id)}`;
  const imageBuffer = await renderScreenshot(imageUrl);

  return new Response(imageBuffer as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};

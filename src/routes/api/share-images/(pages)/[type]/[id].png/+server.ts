import { env } from '$env/dynamic/private';
import renderScreenshot from '../../../../shared/render-screenshot.js';

export const GET = async ({ params }) => {
  const { type, id } = params;

  // browser that will render the image is running alongside the app server in the same image, so we do localhost
  // this will not work in dev mode - but you can still preview the image without the .png in the URL 🤷
  const imageUrl = `http://127.0.0.1:${env.PORT ?? 8080}/api/share-images-new/${type}/${encodeURIComponent(id)}`;
  const imageBuffer = await renderScreenshot(imageUrl);

  return new Response(imageBuffer as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};

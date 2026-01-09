import { BASE_URL } from '$lib/utils/base-url.js';
import renderScreenshot from '../../../../shared/render-screenshot.js';

export const GET = async ({ params, url }) => {
  const { type, id } = params;

  // browser that will render the image is running alongside the app server in the same image, so we do localhost
  // this will not work in dev mode - but you can still preview the image without the .png in the URL 🤷
  const imageUrl = `${BASE_URL}/api/share-images/${type}/${encodeURIComponent(id)}?${url.searchParams.toString()}`;
  const imageBuffer = await renderScreenshot(imageUrl);

  return new Response(imageBuffer as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};

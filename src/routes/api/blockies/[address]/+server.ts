import makeBlockie from 'ethereum-blockies-base64';
import type { RequestHandler } from './$types';
import imageDataUri from 'image-data-uri';

export const GET: RequestHandler = async ({ params }) => {
  const blockieDataUri = makeBlockie(params.address);
  const decoded = imageDataUri.decode(blockieDataUri);

  return new Response(decoded.dataBuffer, {
    headers: {
      'content-type': 'image/png',
    },
  });
};

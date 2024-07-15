import makeBlockie from 'ethereum-blockies-base64';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const blockieDataUri = makeBlockie(params.address);

  const regExMatches = blockieDataUri.match('data:(image/.*);base64,(.*)');
  if (!regExMatches) {
    throw new Error('Failed to parse blockie data URI');
  }

  const buffer = Buffer.from(regExMatches[2], 'base64');

  return new Response(buffer, {
    headers: {
      'content-type': 'image/png',
    },
  });
};

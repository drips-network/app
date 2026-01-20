import { error } from '@sveltejs/kit';
import Jimp from 'jimp';

const ALLOWED_SIZES = [412, 100] as const;
const DEFAULT_SIZE = 412;

export const GET = async ({ params, fetch, url }) => {
  const { userId } = params;
  const sizeParam = url.searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam, 10) : DEFAULT_SIZE;

  if (!ALLOWED_SIZES.includes(size as (typeof ALLOWED_SIZES)[number])) {
    throw error(400, `Invalid size. Allowed sizes: ${ALLOWED_SIZES.join(', ')}`);
  }

  const githubAvatarUrl = `https://avatars.githubusercontent.com/u/${userId}?v=4`;
  const response = await fetch(githubAvatarUrl);

  if (!response.ok) {
    throw error(response.status, 'Failed to fetch GitHub avatar');
  }

  const blob = await response.arrayBuffer();
  const image = await Jimp.read(Buffer.from(blob));

  const resized = image.cover(size, size);

  return new Response((await resized.getBufferAsync(Jimp.MIME_PNG)) as BodyInit, {
    headers: {
      'content-type': 'image/png',
    },
  });
};

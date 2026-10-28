import { fetchIpfs } from '$lib/utils/ipfs.js';
import { error } from '@sveltejs/kit';
import { JimpMime } from 'jimp';
import readAvatarImage, {
  MAX_AVATAR_FILE_BYTES,
  readCappedBody,
} from '$lib/utils/read-avatar-image';

export const GET = async ({ params, fetch, url }) => {
  const { cid } = params;
  const sizeParam = url.searchParams.get('size') || '64';
  const size = parseInt(sizeParam, 10);

  if (!Number.isInteger(size) || size < 1 || size > 1000) {
    throw error(400, 'Invalid size');
  }

  const file = await fetchIpfs(cid, fetch);

  if (!file.ok) throw error(404);

  const buffer = await readCappedBody(file, MAX_AVATAR_FILE_BYTES);

  // We read the file into Jimp to resize it when fetching it even though we already resize it when
  // uploading via the /upload route. The reason for that is that theoretically any
  // IPFS CID with a massive image that didn't get uploaded through our endpoint could be
  // submitted. Better safe than sorry 🤷‍♂️

  const image = await readAvatarImage(buffer);

  if ([JimpMime.jpeg as string, JimpMime.png as string].includes(image.mime ?? '') === false) {
    throw new Error('Invalid image format');
  }

  const resized = image.cover({ w: size, h: size });

  return new Response((await resized.getBuffer(JimpMime.png)) as BodyInit, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000',
    },
  });
};

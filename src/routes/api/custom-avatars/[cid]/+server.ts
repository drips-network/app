import { fetchIpfs } from '$lib/utils/ipfs.js';
import Jimp from 'jimp';

export const GET = async ({ params, fetch }) => {
  const { cid } = params;

  const file = await fetchIpfs(cid, fetch);
  const blob = await file.arrayBuffer();

  // We read the file into Jimp to resize it when fetching it even though we already resize it when
  // uploading via the /upload route. The reason for that is that theoretically any
  // IPFS CID with a massive image that didn't get uploaded through our endpoint could be
  // submitted. Better safe than sorry 🤷‍♂️

  const image = await Jimp.read(Buffer.from(blob));

  if ([Jimp.MIME_JPEG as string, Jimp.MIME_PNG as string].includes(image.getMIME()) === false) {
    throw new Error('Invalid image format');
  }

  const resized = image.cover(1000, 1000);

  return new Response(await resized.getBufferAsync(Jimp.MIME_PNG), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=3600',
    },
  });
};

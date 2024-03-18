import { PINATA_SDK_KEY, PINATA_SDK_SECRET } from '$env/static/private';
import Jimp from 'jimp';
import { Readable } from 'stream';

import PinataSdk from '@pinata/sdk';

const pinata = new PinataSdk(PINATA_SDK_KEY, PINATA_SDK_SECRET);

export const POST = async ({ request }) => {
  const blob = await request.arrayBuffer();

  const image = await Jimp.read(Buffer.from(blob));

  if ([Jimp.MIME_JPEG as string, Jimp.MIME_PNG as string].includes(image.getMIME()) === false) {
    throw new Error('Invalid image format');
  }

  const resized = image.cover(1000, 1000);

  const stream = Readable.from(await resized.getBufferAsync(Jimp.MIME_PNG));

  // https://github.com/PinataCloud/Pinata-SDK/issues/28 🤨
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (stream as any)['path'] = 'avatar.png';

  const pin = await pinata.pinFileToIPFS(stream);

  return new Response(JSON.stringify(pin));
};

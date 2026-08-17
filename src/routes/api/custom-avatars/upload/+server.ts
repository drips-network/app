import { Jimp, JimpMime } from 'jimp';
import { error } from '@sveltejs/kit';

import { pinFileToIPFS } from '$lib/utils/pinata';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private.js';

const missingEnvVarError = 'Uploading custom avatars will not work.';

const PINATA_SDK_KEY = getOptionalEnvVar('PINATA_SDK_KEY', true, missingEnvVarError);
const PINATA_SDK_SECRET = getOptionalEnvVar('PINATA_SDK_SECRET', true, missingEnvVarError);

export const POST = async ({ request }) => {
  if (!PINATA_SDK_KEY || !PINATA_SDK_SECRET) {
    return error(500, 'PINATA_SDK_KEY and PINATA_SDK_SECRET env vars are required.');
  }

  const blob = await request.arrayBuffer();

  const image = await Jimp.read(Buffer.from(blob));

  if ([JimpMime.jpeg as string, JimpMime.png as string].includes(image.mime ?? '') === false) {
    throw new Error('Invalid image format');
  }

  const resized = image.cover({ w: 1000, h: 1000 });

  const pin = await pinFileToIPFS(
    { apiKey: PINATA_SDK_KEY, secretApiKey: PINATA_SDK_SECRET },
    new Blob([await resized.getBuffer(JimpMime.png)], { type: JimpMime.png }),
    { name: 'avatar' },
  );

  return new Response(JSON.stringify(pin));
};

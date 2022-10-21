import 'dotenv/config';
import pinataSdk from '@pinata/sdk';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import getEnvVar from '$lib/utils/get-env-var';

const pinata = pinataSdk(getEnvVar('PINATA_SDK_KEY'), getEnvVar('PINATA_SDK_SECRET'));

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  const res = await pinata.pinJSONToIPFS(await request.json(), {
    pinataOptions: {
      cidVersion: 0,
    },
  });

  return new Response(res.IpfsHash);
};

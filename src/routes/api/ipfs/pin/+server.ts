import 'dotenv/config';
import pinataSdk from '@pinata/sdk';
import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import getEnvVar from '$lib/utils/get-env-var';
import { accountMetadataSchema } from '$lib/stores/streams/metadata';

const pinata = pinataSdk(getEnvVar('PINATA_SDK_KEY'), getEnvVar('PINATA_SDK_SECRET'));

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  try {
    const json = await request.json();

    accountMetadataSchema.parse(json);

    const res = await pinata.pinJSONToIPFS(json, {
      pinataOptions: {
        cidVersion: 0,
      },
    });

    return new Response(res.IpfsHash);
  } catch (e) {
    throw error(500, "This doesn't seem to be valid account metadata 🤨");
  }
};

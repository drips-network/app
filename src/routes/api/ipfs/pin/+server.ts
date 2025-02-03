import pinataSdk from '@pinata/sdk';
import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const missingEnvVarError =
  "Uploading IPFS metadata won't work. This means all flows that edit metadata (creating streams, drip lists, claiming projects, etc.) will not work.";

const PINATA_SDK_KEY = getOptionalEnvVar('PINATA_SDK_KEY', true, missingEnvVarError);
const PINATA_SDK_SECRET = getOptionalEnvVar('PINATA_SDK_SECRET', true, missingEnvVarError);

const pinata = new pinataSdk(PINATA_SDK_KEY, PINATA_SDK_SECRET);

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  if (!PINATA_SDK_KEY || !PINATA_SDK_SECRET) {
    return error(500, 'PINATA_SDK_KEY and PINATA_SDK_SECRET env vars are required.');
  }

  const E2E_FAKE_PINATA_URL = getOptionalEnvVar('E2E_FAKE_PINATA_URL', false, undefined);

  try {
    const json = await request.json();

    if (E2E_FAKE_PINATA_URL) {
      // When running a local env, the "fake pinata" service runs at localhost:3000.

      const res = await fetch(`${E2E_FAKE_PINATA_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        body: JSON.stringify({
          pinataContent: json,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const resBody = z.object({ IpfsHash: z.string() }).parse(await res.json());

      return new Response(resBody.IpfsHash);
    } else {
      const res = await pinata.pinJSONToIPFS(json, {
        pinataOptions: {
          cidVersion: 0,
        },
      });

      return new Response(res.IpfsHash);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('💧 ~ Failed to pin on Pinata:', e);

    error(500, 'Something went wrong while pinning metadata to IPFS.');
  }
};

import 'dotenv/config';

import getEnvVar from '$lib/utils/get-env-var';
import type { RequestHandler } from './$types';

const TENDERLY_USER = getEnvVar('TENDERLY_USER');
const TENDERLY_PROJECT = getEnvVar('TENDERLY_PROJECT');
const TENDERLY_ACCESS_SECRET = getEnvVar('TENDERLY_ACCESS_SECRET');

export const POST: RequestHandler = async ({ request }) => {
  const resp = await fetch(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate-bundle`,
    {
      method: 'POST',
      body: JSON.stringify(await request.json()),
      headers: {
        'X-Access-Key': TENDERLY_ACCESS_SECRET,
      },
    },
  );

  return new Response(JSON.stringify(await resp.json()));
};

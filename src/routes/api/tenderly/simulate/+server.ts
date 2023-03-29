import { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_SECRET } from '$env/static/private';

import type { RequestHandler } from './$types';

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

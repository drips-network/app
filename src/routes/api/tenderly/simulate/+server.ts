import { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_SECRET } from '$env/static/private';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const resp = await (
      await fetch(
        `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate-bundle`,
        {
          method: 'POST',
          body: JSON.stringify(await request.json()),
          headers: {
            'X-Access-Key': TENDERLY_ACCESS_SECRET,
          },
        },
      )
    ).json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gasEstimations: { estimatedGas: number }[] = resp.simulation_results.map((r: any) => ({
      estimatedGas: r.simulation.gas_used,
    }));

    return new Response(JSON.stringify(gasEstimations));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to simulate bundle:', e);

    return new Response(JSON.stringify('Failed to simulate bundle'), { status: 500 });
  }
};

import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

const missingEnvVarError =
  "Estimation of gas won't work, so transaction planning will fail on networks that have `applyGasBuffer` set to true.";

const TENDERLY_USER = getOptionalEnvVar('TENDERLY_USER', true, missingEnvVarError);
const TENDERLY_PROJECT = getOptionalEnvVar('TENDERLY_PROJECT', true, missingEnvVarError);
const TENDERLY_ACCESS_SECRET = getOptionalEnvVar(
  'TENDERLY_ACCESS_SECRET',
  true,
  missingEnvVarError,
);

export const POST: RequestHandler = async ({ request }) => {
  if (!TENDERLY_USER || !TENDERLY_PROJECT || !TENDERLY_ACCESS_SECRET) {
    return error(
      500,
      'TENDERLY_USER, TENDERLY_PROJECT, and TENDERLY_ACCESS_SECRET env vars are required.',
    );
  }

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

import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

export const load = (async ({ fetch, request }) => {
  const isIframe = request.headers.get('Sec-Fetch-Dest') === 'iframe';

  const isAlternativeChain = getOptionalEnvVar('PUBLIC_ALTERNATIVE_CHAIN_MODE');

  if (isIframe) {
    // Only valid use for iFrame is running the app as a Safe App within the Safe UI.
    // In that case, we want to skip the LP and go straight to the app, which will then try
    // to auto-connect the Safe.

    return redirect(307, '/app');
  }

  // TODO: Remove when we go full multi-chain.
  if (isAlternativeChain) {
    return redirect(308, '/app');
  }

  const prices = await cachedTotalDrippedPrices(redis, fetch);

  return {
    prices,
  };
}) satisfies PageServerLoad;

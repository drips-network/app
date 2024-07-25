import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';

export const load = (async ({ fetch, request }) => {
  const isIframe = request.headers.get('Sec-Fetch-Dest') === 'iframe';
  if (isIframe) {
    // Only valid use for iFrame is running the app as a Safe App within the Safe UI.
    // In that case, we want to skip the LP and go straight to the app, which will then try
    // to auto-connect the Safe.
    return redirect(307, '/app');
  }

  const prices = await cachedTotalDrippedPrices(redis, fetch);

  return {
    prices,
  };
}) satisfies PageServerLoad;

import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';

export const load = (async ({ fetch }) => {
  const prices = await cachedTotalDrippedPrices(redis, fetch);

  return {
    prices,
  };
}) satisfies PageServerLoad;

import { env } from '$env/dynamic/private';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import type { PageServerLoad } from './$types';
import { getRedis } from './api/redis';

export const load = (async ({ fetch }) => {
  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  const prices = await cachedTotalDrippedPrices(redis, fetch);

  return {
    prices,
  };
}) satisfies PageServerLoad;

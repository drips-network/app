import { env } from '$env/dynamic/private';
import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { getRedis } from './api/redis';
import type { Prices } from '$lib/utils/fiat-estimates/fiat-estimates';
import { utils } from 'ethers';

export const load = (async ({ fetch }) => {
  let prices: Prices = {};
  const cacheKey = 'total-dripped-prices';

  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  const cachedResponse = redis && (await redis.get(cacheKey));

  if (cachedResponse) {
    prices = JSON.parse(cachedResponse);
  } else {
    const tokenAddresses = totalDrippedApproximation().map((a) => a.tokenAddress.toLowerCase());

    // get pricing provider's tokenIds of our tokenAddresses...
    const idMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();
    const idMap = z.record(z.string(), z.number()).parse(idMapRes);
    const tokenIdsString = tokenAddresses.map((address) => idMap[address.toLowerCase()]).join(',');

    // fetch prices...
    const priceRes = await fetch(`/api/fiat-estimates/price/${tokenIdsString}`);
    const parsedRes = z.record(z.string(), z.number()).parse(await priceRes.json());

    // format
    tokenAddresses.forEach(
      (address: string) => (prices[utils.getAddress(address)] = parsedRes[idMap[address]]),
    );

    await redis?.set(cacheKey, JSON.stringify(prices), {
      EX: 3600,
    });
  }

  return {
    prices,
  };
}) satisfies PageServerLoad;

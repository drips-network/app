import { env } from '$env/dynamic/private';
import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { getRedis } from './api/redis';

const amountsResponseSchema = z.array(
  z.object({
    tokenAddress: z.string(),
    amount: z.string(),
  }),
);

export const load = (async () => {
  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  const cachedResponse = redis && (await redis.get('total-dripped-approx'));

  let amounts: z.infer<typeof amountsResponseSchema>;

  if (cachedResponse) {
    amounts = amountsResponseSchema.parse(JSON.parse(cachedResponse));
  } else {
    amounts = totalDrippedApproximation().map((row) => ({
      ...row,
      amount: row.amount.toString(),
    }));

    await redis?.set('total-dripped-approx', JSON.stringify(amounts), {
      EX: 3600,
    });
  }

  return {
    amounts,
  };
}) satisfies PageServerLoad;

/* 
"List Blueprints" allow submitting a list of splits in return for a "blueprint ID".
Then, the user can be sent off to /app/funder-onboarding?blueprintId=XYZ, which will retrieve
the blueprint and pre-fill the splits in the onboarding flow.

We store blueprints on Redis with a short TTL of 6 hours, since they are meant to be
short-lived and temporary.
*/

import { error } from '@sveltejs/kit';
import { redis } from '../redis';
import network from '$lib/stores/wallet/network';
import { blueprintSchema } from './blueprintSchema';

export const PUT = async ({ request }) => {
  if (!redis) return error(503, 'Redis not available');

  const body = await request.json();

  const parsed = blueprintSchema.safeParse(body);

  if (!parsed.success) {
    throw error(400, parsed.error);
  }

  const id = crypto.randomUUID();

  await redis.set(`list-blueprint:${network.chainId}:${id}`, JSON.stringify(parsed.data), {
    EX: 60 * 60 * 6, // 6 hours
  });

  return new Response(JSON.stringify({ id, expiresAt: Date.now() + 60 * 60 * 6 * 1000 }));
};

import { error } from '@sveltejs/kit';
import { redis } from '../../redis';
import network from '$lib/stores/wallet/network';
import { blueprintSchema } from '../blueprintSchema';

export const GET = async ({ params }) => {
  if (!redis) return error(503, 'Redis not available');

  const { blueprintId: id } = params;

  const data = await redis.get(`list-blueprint:${network.chainId}:${id}`);
  if (!data) {
    throw error(404, 'Blueprint not found or expired');
  }

  try {
    const asJson = JSON.parse(data);
    const parsed = blueprintSchema.safeParse(asJson);

    if (!parsed.success) {
      throw error(500, 'Invalid blueprint stored');
    }

    return new Response(JSON.stringify(parsed.data));
  } catch {
    throw error(500, 'Failed to parse blueprint');
  }
};

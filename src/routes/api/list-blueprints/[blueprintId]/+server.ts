import { error } from '@sveltejs/kit';
import { redis } from '../../redis';
import network from '$lib/stores/wallet/network';
import { blueprintSchema } from '../../../../lib/utils/blueprints/schemas';

export const GET = async ({ params }) => {
  if (!redis) return error(503, 'Redis not available');

  const { blueprintId: id } = params;

  const data = await redis.get(`list-blueprint:${network.chainId}:${id}`);
  if (!data) {
    throw error(404, 'Blueprint not found or expired');
  }

  let asJson: unknown;
  try {
    asJson = JSON.parse(data);
  } catch {
    throw error(500, 'Failed to parse blueprint');
  }

  const parsed = blueprintSchema.safeParse(asJson);

  if (!parsed.success) {
    throw error(500, 'Invalid blueprint stored');
  }

  return new Response(JSON.stringify(parsed.data));
};

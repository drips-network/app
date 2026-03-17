import { error } from '@sveltejs/kit';
import assert from '$lib/utils/assert';
import assert0xString from '$lib/utils/assert0x';
import { redis } from '../../redis';
import { relayer } from '../gelato';
import { StatusCode } from '@gelatocloud/gasless';
import { buildRequestOwnerUpdateTx } from './build-txs';
import type { Forge } from '$lib/utils/sdk/sdk-types';

/**
 * Shared relay logic for owner update transactions (repo and ORCID).
 * Handles deduplication via Redis and sends the transaction through Gelato.
 */
export async function relayOwnerUpdateTx(
  blockKey: string,
  forge: Forge,
  name: string,
  chainId: number,
): Promise<Response> {
  assert(relayer, 'Gelato Relayer client not initialized');
  assert(redis, 'Redis client not initialized');

  const existingTaskId = await redis.get(blockKey);

  if (existingTaskId) {
    const { status } = await relayer.getStatus({ id: existingTaskId });

    if ([StatusCode.Pending, StatusCode.Submitted].includes(status)) {
      return new Response(JSON.stringify({ taskId: existingTaskId }));
    } else {
      await redis.del(blockKey);
    }
  }

  const tx = await buildRequestOwnerUpdateTx(forge, name);

  assert0xString(tx.to);
  assert0xString(tx.data);

  try {
    const taskId = await relayer.sendTransaction({
      to: tx.to,
      data: tx.data,
      chainId,
    });

    // eslint-disable-next-line no-console
    console.log('RELAY_RESPONSE', taskId);

    redis.set(blockKey, taskId, {
      // 4 hours
      EX: 4 * 60 * 60,
    });

    return new Response(JSON.stringify({ taskId }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(500, e instanceof Error ? e : 'Unknown error');
  }
}

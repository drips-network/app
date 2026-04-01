import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import network from '$lib/stores/wallet/network';
import { ethers, JsonRpcProvider } from 'ethers';
import { repoDriverAbi } from '$lib/utils/sdk/repo-driver/repo-driver-abi';
import assert from '$lib/utils/assert';
import assert0xString from '$lib/utils/assert0x';
import { relayer } from '../../gelato';
import { StatusCode } from '@gelatocloud/gasless';
import { redis } from '../../../redis';

const payloadSchema = z.object({
  sourceId: z.number(),
  name: z.string(),
  owner: z.string(),
  timestamp: z.number(),
  r: z.string(),
  vs: z.string(),
  chainId: z.number(),
});

export const POST: RequestHandler = async ({ request }) => {
  if (!relayer) {
    return error(503, 'Gelato Relayer client not initialized');
  }

  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    return error(400, 'Invalid payload');
  }

  const { sourceId, name, owner, timestamp, r, vs, chainId } = payload;

  if (network.chainId !== chainId) {
    return error(400, 'Unsupported chain id');
  }

  const provider = new JsonRpcProvider(network.rpcUrl);
  const contract = new ethers.Contract(network.contracts.REPO_DRIVER, repoDriverAbi, provider);

  const tx = await contract.updateOwnerByLit.populateTransaction(
    sourceId,
    name,
    owner,
    timestamp,
    r,
    vs,
  );

  assert0xString(tx.to);
  assert0xString(tx.data);

  assert(redis, 'Redis client not initialized');

  const blockKey = `${network.name}-litOwnerUpdate-${name}`;
  const existingTaskId = await redis.get(blockKey);

  if (existingTaskId) {
    const { status } = await relayer.getStatus({ id: existingTaskId });

    if ([StatusCode.Pending, StatusCode.Submitted].includes(status)) {
      return new Response(JSON.stringify({ taskId: existingTaskId }));
    } else {
      await redis.del(blockKey);
    }
  }

  try {
    const taskId = await relayer.sendTransaction({
      chainId,
      to: tx.to,
      data: tx.data,
    });

    // eslint-disable-next-line no-console
    console.log('LIT_OWNER_UPDATE_RELAY_RESPONSE', taskId);

    redis.set(blockKey, taskId, {
      // 4 hours
      EX: 4 * 60 * 60,
    });

    return new Response(JSON.stringify({ taskId }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(500, e instanceof Error ? e.message : 'Unknown error');
  }
};

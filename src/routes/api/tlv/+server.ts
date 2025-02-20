import { z } from 'zod';
import { redis } from '../redis.js';
import { formatUnits } from 'ethers';
import network from '$lib/stores/wallet/network.js';

import getEthMainnetTlv from './tlv-sources/eth-mainnet.js';
import type { TLVResult } from './types.js';
import getBlockscoutChainsTlv from './tlv-sources/blockscout-chains.js';

const CACHE_KEY = `${network.name}-explore.tlv-estimate`;

export const GET = async ({ fetch }) => {
  const cached = redis && (await redis.get(CACHE_KEY));

  if (cached) {
    return new Response(cached);
  }

  let tokenHoldings: TLVResult[] = [];

  try {
    tokenHoldings = (await Promise.all([getEthMainnetTlv(fetch), getBlockscoutChainsTlv(fetch)]))
      .flat(1)
      .reduce<TLVResult[]>((res, { tokenAddress, amount, decimals }) => {
        const existingEntry = res.findIndex(
          (v) => v.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
        );

        if (existingEntry === -1) {
          res.push({
            tokenAddress,
            amount,
            decimals,
          });
        } else {
          res[existingEntry].amount += amount;
        }

        return res;
      }, []);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failure fetching TLV', e);

    return new Response('Failed to fetch TLV data.', {
      status: 500,
    });
  }

  if (tokenHoldings.length === 0) {
    return new Response('0');
  }

  const cmcIdMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();
  const cmcIdMap = z.record(z.number()).parse(cmcIdMapRes);

  const relevantCmcIds = Object.fromEntries(
    Object.entries(cmcIdMap).filter(([address]) =>
      tokenHoldings.some((v) => v.tokenAddress.toLowerCase() === address.toLowerCase()),
    ),
  );

  const fiatConversionsRes = await (
    await fetch(`/api/fiat-estimates/price/${Object.values(relevantCmcIds).join(',')}`)
  ).json();
  const fiatConversions = z.record(z.number()).parse(fiatConversionsRes);

  let total = 0;

  for (const [cmcId, value] of Object.entries(fiatConversions)) {
    const tokenAddress = Object.entries(cmcIdMap).find((v) => cmcId === v[1].toString())?.[0];
    if (!tokenAddress) break;

    const tokenHoldingRecord = tokenHoldings.find(
      (v) => v.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!tokenHoldingRecord) break;

    total =
      total +
      Number(formatUnits(tokenHoldingRecord.amount, Number(tokenHoldingRecord.decimals))) * value;
  }

  await redis?.set(CACHE_KEY, total.toString(), {
    EX: 86400,
  });

  return new Response(total.toString(), {
    headers: {
      'cache-control': 'public, max-age=3600',
    },
  });
};

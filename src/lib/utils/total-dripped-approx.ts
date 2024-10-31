import { z } from 'zod';
import cached from './cache/remote/cached';
import isTest from './is-test';
import type { RedisClientType } from '../../routes/api/redis';
import { getAddress } from 'ethers';

const STREAMS = [
  // ENS USDC
  {
    token: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    started: new Date('May 20, 2024, 10:04 PM').getTime(),
    amtPerSec: '3215277777777',
  },
];

const GIVES = [
  // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: BigInt('9380000000000000000'),
  },
  // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: BigInt('34529995660000000000'),
  },
  // Radworks USDC https://www.drips.network/app/808735843097274646438052281344003835551042056378/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/streams/0
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: BigInt('499999999999'),
  },
  // Radworks RAD https://www.drips.network/app/808735843097274646438052281344003835551042056378/tokens/0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3/streams/0
  // Total of the stream which is now stopped
  {
    tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    amount: BigInt('373134000000000000000000'),
  },
];

export default function totalDrippedApproximation() {
  const streamedAmounts = STREAMS.map((stream) => {
    const duration = (Date.now() - stream.started) / 1000;

    return {
      tokenAddress: stream.token.address.toLowerCase(),
      amount: BigInt(Math.floor(Number(BigInt(stream.amtPerSec) / BigInt(1e9)) * duration)),
    };
  });

  return [...GIVES, ...streamedAmounts];
}

const TOTAL_DRIPPED_PRICES_CACHE_KEY = 'total-dripped-prices';

export const totalDrippedPrices = async (fetch = window.fetch, tokenAddresses?: string[]) => {
  // In test env, we can't fetch prices from CMC, so we don't.
  if (isTest()) return {};

  if (!tokenAddresses) {
    tokenAddresses = totalDrippedApproximation().map((a) => a.tokenAddress.toLowerCase());
  }

  try {
    // get response of known token address => token id
    const idMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();
    // produce map of response
    const idMap = z.record(z.string(), z.number()).parse(idMapRes);
    // create parameter for /api/fiat-estimates/price endpoint, removing unknown token ids
    const tokenIdsString = tokenAddresses
      .reduce((memo, address) => {
        const id = idMap[address.toLowerCase()];
        if (id !== undefined) {
          memo.push(id);
        }

        return memo;
      }, [] as number[])
      .join(',');

    let parsedRes: Record<string, number> = {};
    if (tokenIdsString.length) {
      // get response of prices for token ids
      const priceRes = await fetch(`/api/fiat-estimates/price/${tokenIdsString}`);
      // get parsed map of response, token id => token fiat price
      parsedRes = z.record(z.string(), z.number()).parse(await priceRes.json());
    }

    // return tokend address => amount in fiat
    return tokenAddresses.reduce<Record<string, number>>((acc, address) => {
      acc[getAddress(address)] = parsedRes[idMap[address]];
      return acc;
    }, {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return {};
  }
};

export const cachedTotalDrippedPrices = (
  redis: RedisClientType | undefined,
  fetch = window.fetch,
) =>
  cached(redis, TOTAL_DRIPPED_PRICES_CACHE_KEY, 60 * 60 * 6, () => {
    return totalDrippedPrices(fetch);
  });

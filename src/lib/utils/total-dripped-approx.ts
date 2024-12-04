import cached from './cache/remote/cached';
import isTest from './is-test';
import type { RedisClientType } from '../../routes/api/redis';
import { getCmcPrices } from './cmc';
import mergeAmounts from './amounts/merge-amounts';
import contractConstants from './sdk/utils/contract-constants';
import network from '$lib/stores/wallet/network';
import cacheKey from './cache/remote/cache-key';

const STREAMS = [
  // ENS USDC
  {
    token: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    started: new Date('May 20, 2024, 10:04 PM').getTime(),
    amtPerSec: '3215277777777',
  },
  // Second FTC list USDGLO (they have two lists for some reason) https://www.drips.network/app/drip-lists/36167722434539895740687283110259945938004377627588501179309095983175
  {
    token: {
      address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3',
    },
    started: new Date('March 8, 2024, 11:34 PM').getTime(),
    amtPerSec: '385802469135802469135802',
  },
];

const GIVES = [
  // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '9380000000000000000',
  },
  // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '34529995660000000000',
  },
  // Radworks USDC https://www.drips.network/app/808735843097274646438052281344003835551042056378/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/streams/0
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '499999999999',
  },
  // Radworks RAD https://www.drips.network/app/808735843097274646438052281344003835551042056378/tokens/0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3/streams/0
  // Total of the stream which is now stopped
  {
    tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    amount: '373134000000000000000000',
  },
  // Scroll Hackathon https://www.drips.network/app/drip-lists/41971962915943119138973997144514496143454239023249281594792952267407
  // Total of the two one-time USDC donations
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '22500800698',
  },
  // First FTC list USD (they have two for some reason) https://drips.network/app/drip-lists/36167722434539895740687283110259945938004377627588501179309095983174
  // The 10k matching donation we did for their list
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '10000000000',
  },
  // First FTC list WETH (they have two for some reason) https://drips.network/app/drip-lists/36167722434539895740687283110259945938004377627588501179309095983174
  // Total of the stream which is now stopped
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '100000000000000000',
  },
];

export default function totalDrippedApproximation() {
  const streamedAmounts = STREAMS.map((stream) => {
    const duration = (Date.now() - stream.started) / 1000;

    return {
      tokenAddress: stream.token.address.toLowerCase(),
      amount: BigInt(
        Math.floor(
          Number(BigInt(stream.amtPerSec) / BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER)) *
            duration,
        ),
      ),
    };
  });

  return mergeAmounts(GIVES, streamedAmounts);
}

`${network.name}:total-dripped-prices`;

export const totalDrippedPrices = (fetch = window.fetch) => {
  // In test env, we can't fetch prices from CMC, so we don't.
  if (isTest()) return {};

  const tokenAddresses = totalDrippedApproximation().map((a) => a.tokenAddress.toLowerCase());
  return getCmcPrices(tokenAddresses, fetch);
};

export const cachedTotalDrippedPrices = (
  redis: RedisClientType | undefined,
  fetch = window.fetch,
) => {
  const TOTAL_DRIPPED_PRICES_CACHE_KEY = cacheKey(
    JSON.stringify(STREAMS) + JSON.stringify(GIVES),
    `${network.name}:total-dripped-prices`,
  );

  return cached(redis, TOTAL_DRIPPED_PRICES_CACHE_KEY, 60 * 60 * 6, async () => {
    // if the underlying getCmcPrices function fails, {} is returned
    // and will become cached
    return totalDrippedPrices(fetch);
  });
};

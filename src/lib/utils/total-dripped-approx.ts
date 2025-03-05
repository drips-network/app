import cached from './cache/remote/cached';
import type { RedisClientType } from '../../routes/api/redis';
import { getCmcPrices } from './cmc';
import mergeAmounts from './amounts/merge-amounts';
import contractConstants from './sdk/utils/contract-constants';
import network from '$lib/stores/wallet/network';
import cacheKey from './cache/remote/cache-key';

const STREAMS: {
  token: { address: string };
  started: number;
  endsAt: number;
  amtPerSec: string;
}[] = [
  // Filecoin RPGF-2 PG donation https://filecoin.drips.network/app/976822925357514561093139105352740088169738576235/tokens/0x60E1773636CF5E4A227d9AC24F20fEca034ee25A/streams/4192296931
  {
    token: { address: '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A' },
    started: 1738347480000,
    endsAt: 1740939492000,
    amtPerSec: '70062152777777777777777777',
  },
  // 2nd Filecoin RPGF-2 donation https://filecoin.drips.network/app/976822925357514561093139105352740088169738576235/tokens/0x60E1773636CF5E4A227d9AC24F20fEca034ee25A/streams/2080508173
  {
    token: { address: '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A' },
    started: 1741132800000,
    endsAt: 1743724802000,
    amtPerSec: '24459452160493827160493827',
  },
];

const GIVES = [
  // Radworks Grant https://www.drips.network/app/drip-lists/40866246603895578971810925870326321539836543960399385681839516039553
  {
    tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    amount: '500000000000000000000',
  },
  // ENS USDC (total of the completed stream) https://www.drips.network/app/219944633562831898862545170897344561225692372227/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/streams/465197764
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '50000000000',
  },
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
  // FTC Hackathon https://www.drips.network/app/drip-lists/52160683947500777897245112345440145070270524255497353311432845427957
  {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '9000000000',
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
    const calcUntil = Math.min(Date.now(), stream.endsAt);
    const duration = (calcUntil - stream.started) / 1000;

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

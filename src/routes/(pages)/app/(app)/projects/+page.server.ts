import {
  createDefaultFetchProjectsParameters,
  fetchAndCategorizeProjects,
  fetchProjectsQuery,
} from './components/load-projects';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import fetchChainStats, { chainStatsQuery } from '../components/load-chain-stats';
import network from '$lib/stores/wallet/network';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redis } from '../../../../api/redis';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import cached from '$lib/utils/cache/remote/cached';

export const load = async ({ fetch }) => {
  const connectedAccountId = get(walletStore).dripsAccountId;

  const fetchProjectsParameters = createDefaultFetchProjectsParameters();

  const cacheKey = queryCacheKey(
    fetchProjectsQuery + chainStatsQuery,
    [Object.entries(fetchProjectsParameters), { chains: [network.gqlName] }],
    'dashboard:projects',
  );

  const [{ featuredProjects, yourProjects, restProjects }, chainStats, totalDrippedPrices] =
    await cached(
      redis,
      cacheKey,
      1 * 60 * 60, // 1 hr
      async () =>
        Promise.all([
          fetchAndCategorizeProjects(network.chainId, fetch, connectedAccountId),
          fetchChainStats(fetch),
          cachedTotalDrippedPrices(redis, fetch),
        ]),
    );

  return {
    yourProjects,
    restProjects,
    featuredProjects,
    chainStats,
    totalDrippedPrices,
    preservePathOnNetworkChange: true,
  };
};

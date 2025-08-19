import { fetchAndCategorizeProjects } from './components/load-projects';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import type { ChainStatsQuery } from '../components/__generated__/gql.generated';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import fetchChainStats from '../components/load-chain-stats';
import network from '$lib/stores/wallet/network';
import type { ProjectQuery } from './components/__generated__/gql.generated';
import {
  default as fetchTotalDrippedApproximation,
  totalDrippedPrices as fetchTotalDrippedPrices,
} from '$lib/utils/total-dripped-approx';

const fetchedDataCache = makeFetchedDataCache<{
  yourProjects: ProjectQuery['projectById'][];
  restProjects: ProjectQuery['projectById'][];
  featuredProjects: ProjectQuery['projectById'][];
  chainStats: ChainStatsQuery['chainStats'][number];
  totalDrippedPrices: Awaited<ReturnType<typeof fetchTotalDrippedPrices>>;
  totalDrippedAmounts: Awaited<ReturnType<typeof fetchTotalDrippedApproximation>>;
}>('dashboard:projects');

export const load = async ({ fetch }) => {
  const connectedAccountId = get(walletStore).dripsAccountId;

  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  const totalDrippedAmounts = fetchTotalDrippedApproximation();
  const [{ featuredProjects, yourProjects, restProjects }, chainStats, totalDrippedPrices] =
    await Promise.all([
      fetchAndCategorizeProjects(network.chainId, fetch, connectedAccountId),
      fetchChainStats(fetch),
      fetchTotalDrippedPrices(fetch),
    ]);

  fetchedDataCache.write({
    yourProjects,
    restProjects,
    featuredProjects,
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
  });

  return {
    yourProjects,
    restProjects,
    featuredProjects,
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

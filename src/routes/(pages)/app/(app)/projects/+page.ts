import { fetchAndCategorizeProjects } from './components/load-projects';
import type { ChainStatsQuery } from '../components/__generated__/gql.generated';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import fetchChainStats from '../components/load-chain-stats';
import network from '$lib/stores/wallet/network';
import type { ExploreProjectsQuery, ProjectQuery } from './components/__generated__/gql.generated';
import {
  default as fetchTotalDrippedApproximation,
  totalDrippedPrices as fetchTotalDrippedPrices,
} from '$lib/utils/total-dripped-approx';
import getConnectedAddress from '$lib/utils/get-connected-address';

const fetchedDataCache = makeFetchedDataCache<{
  yourProjects: ExploreProjectsQuery['projects'];
  restProjects: ExploreProjectsQuery['projects'];
  featuredProjects: NonNullable<ProjectQuery['projectById']>[];
  chainStats: ChainStatsQuery['chainStats'][number];
  totalDrippedPrices: Awaited<ReturnType<typeof fetchTotalDrippedPrices>>;
  totalDrippedAmounts: Awaited<ReturnType<typeof fetchTotalDrippedApproximation>>;
}>('dashboard:projects');

export const load = async ({ fetch }) => {
  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  const connectedAddress = getConnectedAddress();
  const totalDrippedAmounts = fetchTotalDrippedApproximation();
  const [{ featuredProjects, yourProjects, restProjects }, chainStats, totalDrippedPrices] =
    await Promise.all([
      fetchAndCategorizeProjects(network.chainId, fetch, connectedAddress),
      fetchChainStats(fetch),
      fetchTotalDrippedPrices(fetch),
    ]);

  const responsePayload = {
    yourProjects,
    restProjects,
    featuredProjects: featuredProjects.filter(
      (project): project is NonNullable<ProjectQuery['projectById']> => Boolean(project),
    ),
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
  };

  fetchedDataCache.write(responsePayload);

  return {
    ...responsePayload,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

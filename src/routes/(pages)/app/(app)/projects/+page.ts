// import network from '$lib/stores/wallet/network';
import { fetchAndCategorizeProjects } from '../components/load-projects';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
// import EXPLORE_PAGE_CONFIG from '../components/explore-page-config';
import type {
  ChainStatsQuery,
  ExploreProjectsQuery,
} from '../components/__generated__/gql.generated';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import fetchChainStats from '../components/load-chain-stats';
import network from '$lib/stores/wallet/network';

const fetchedDataCache = makeFetchedDataCache<{
  yourProjects: ExploreProjectsQuery['projects'];
  restProjects: ExploreProjectsQuery['projects'];
  featuredProjects: ExploreProjectsQuery['projects'];
  chainStats: ChainStatsQuery['chainStats'][number];
}>('dashboard:projects');

export const load = async ({ fetch }) => {
  const connectedAccountId = get(walletStore).dripsAccountId;

  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  const [{ featuredProjects, yourProjects, restProjects }, chainStats] = await Promise.all([
    fetchAndCategorizeProjects(network.chainId, fetch, connectedAccountId),
    fetchChainStats(fetch),
  ]);

  // const featuredProjects = [];
  // const yourProjects = [];
  // const restProjects = [];
  // for (const project of projects) {
  //   // TODO: necessary? Don't we already query using the current chain?
  //   // const chainData = filterCurrentChainData(project.chainData)
  //   if (project.chainData.some((chainData) => chainData.owner?.accountId === connectedAccountId)) {
  //     yourProjects.push(project);
  //   }

  //   if (
  //     EXPLORE_PAGE_CONFIG[network.chainId]?.featuredProjectIds?.includes(project.account.accountId)
  //   ) {
  //     featuredProjects.push(project);
  //     continue;
  //   }

  //   restProjects.push(project);
  // }

  fetchedDataCache.write({
    yourProjects,
    restProjects,
    featuredProjects,
    chainStats,
  });

  return {
    yourProjects,
    restProjects,
    featuredProjects,
    chainStats,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

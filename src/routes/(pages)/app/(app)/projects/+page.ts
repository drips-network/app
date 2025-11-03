import { fetchAndCategorizeProjects } from './components/load-projects';
import fetchChainStats from '../components/load-chain-stats';
import network from '$lib/stores/wallet/network';
import type { ProjectQuery } from './components/__generated__/gql.generated';
import {
  default as fetchTotalDrippedApproximation,
  totalDrippedPrices as fetchTotalDrippedPrices,
} from '$lib/utils/total-dripped-approx';
import getConnectedAddress from '$lib/utils/get-connected-address';

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();
  const totalDrippedAmounts = fetchTotalDrippedApproximation();
  const [{ featuredProjects, yourProjects, restProjects }, chainStats, totalDrippedPrices] =
    await Promise.all([
      fetchAndCategorizeProjects(network.chainId, fetch, connectedAddress),
      fetchChainStats(fetch),
      fetchTotalDrippedPrices(fetch),
    ]);

  return {
    yourProjects,
    restProjects,
    featuredProjects: featuredProjects.filter(
      (project): project is NonNullable<ProjectQuery['projectById']> => Boolean(project),
    ),
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

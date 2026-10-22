import getConnectedAddress from '$lib/utils/get-connected-address';
import fetchCategorziedDripLists from './components/load-drip-lists';
import network from '$lib/stores/wallet/network';
import fetchChainStats from '../components/load-chain-stats';
import {
  default as fetchTotalDrippedApproximation,
  totalDrippedPrices as fetchTotalDrippedPrices,
} from '$lib/utils/total-dripped-approx';

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  const totalDrippedAmounts = fetchTotalDrippedApproximation();
  const [{ featuredDripLists, yourDripLists, restDripLists }, chainStats, totalDrippedPrices] =
    await Promise.all([
      fetchCategorziedDripLists(network.chainId, fetch, connectedAddress),
      fetchChainStats(fetch),
      fetchTotalDrippedPrices(fetch),
    ]);

  return {
    yourDripLists,
    restDripLists,
    featuredDripLists,
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

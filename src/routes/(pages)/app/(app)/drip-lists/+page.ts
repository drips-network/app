import { getVotingRounds } from '$lib/utils/multiplayer';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
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
  const [
    votingRounds,
    { featuredDripLists, yourDripLists, restDripLists },
    chainStats,
    totalDrippedPrices,
  ] = await Promise.all([
    !connectedAddress
      ? Promise.resolve([])
      : getVotingRounds({ publisherAddress: connectedAddress }, fetch),
    fetchCategorziedDripLists(network.chainId, fetch, connectedAddress),
    fetchChainStats(fetch),
    fetchTotalDrippedPrices(fetch),
  ]);

  const votingRoundsWithResults = votingRounds.filter((v) => v.result);

  const votingRoundsSplits = await Promise.all(
    votingRoundsWithResults.map((v) => v.result && mapSplitsFromMultiplayerResults(v.result)),
  );

  const votingRoundsWithSplits = votingRounds.map((v) => ({
    ...v,
    splits: votingRoundsSplits[votingRoundsWithResults.findIndex((vR) => vR.id === v.id)] ?? [],
  }));

  return {
    yourDripLists,
    restDripLists,
    featuredDripLists,
    votingRounds: votingRoundsWithSplits,
    chainStats,
    totalDrippedPrices,
    totalDrippedAmounts,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

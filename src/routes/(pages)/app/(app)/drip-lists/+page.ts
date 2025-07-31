import { getVotingRounds } from '$lib/utils/multiplayer';
import type {} from './__generated__/gql.generated';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
import type { SplitsComponentSplitsReceiver } from '$lib/components/splits/types';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
import fetchAndCategorizeDripLists from './components/load-drip-lists';
import network from '$lib/stores/wallet/network';
import type { ChainStatsQuery } from '../components/__generated__/gql.generated';
import fetchChainStats from '../components/load-chain-stats';
import type { AllDripListsQuery } from './components/__generated__/gql.generated';

type VotingRoundWithSplits = VotingRound & { splits: SplitsComponentSplitsReceiver[] };

const fetchedDataCache = makeFetchedDataCache<{
  yourDripLists: AllDripListsQuery['dripLists'];
  restDripLists: AllDripListsQuery['dripLists'];
  featuredDripLists: AllDripListsQuery['dripLists'];
  chainStats: ChainStatsQuery['chainStats'][number];
  votingRounds: VotingRoundWithSplits[];
}>('dashboard:drip-lists');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  const [votingRounds, { featuredDripLists, yourDripLists, restDripLists }, chainStats] =
    await Promise.all([
      !connectedAddress
        ? Promise.resolve([])
        : getVotingRounds({ publisherAddress: connectedAddress }, fetch),
      fetchAndCategorizeDripLists(network.chainId, fetch, connectedAddress),
      fetchChainStats(fetch),
    ]);

  const votingRoundsWithResults = votingRounds.filter((v) => v.result);

  const votingRoundsSplits = await Promise.all(
    votingRoundsWithResults.map((v) => v.result && mapSplitsFromMultiplayerResults(v.result)),
  );

  const votingRoundsWithSplits = votingRounds.map((v) => ({
    ...v,
    splits: votingRoundsSplits[votingRoundsWithResults.findIndex((vR) => vR.id === v.id)] ?? [],
  }));

  fetchedDataCache.write({
    yourDripLists,
    restDripLists,
    featuredDripLists,
    votingRounds: votingRoundsWithSplits,
    chainStats,
  });

  return {
    yourDripLists,
    restDripLists,
    featuredDripLists,
    votingRounds: votingRoundsWithSplits,
    chainStats,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

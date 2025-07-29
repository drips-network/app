// import query from '$lib/graphql/dripsQL.js';
// import { gql } from 'graphql-request';
// import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from './+page.svelte';
import { getVotingRounds } from '$lib/utils/multiplayer';
import type {} from // DripListsPageQuery,
// DripListsPageQueryVariables,
'./__generated__/gql.generated';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
// import network from '$lib/stores/wallet/network';
import type { SplitsComponentSplitsReceiver } from '$lib/components/splits/types';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
import fetchFeaturedDripLists from '../components/load-featured-drip-lists';
import { fetchDripLists } from '../components/load-drip-lists';
import network from '$lib/stores/wallet/network';
import type { AllDripListsQuery, ChainStatsQuery } from '../components/__generated__/gql.generated';
import fetchChainStats from '../components/load-chain-stats';

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

  // const dripListsPageQuery = gql`
  //   ${DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT}
  //   query DripListsPage($ownerAddress: String, $chains: [SupportedChain!]) {
  //     dripLists(chains: $chains, where: { ownerAddress: $ownerAddress }) {
  //       ...DripListsPageDripList
  //     }
  //   }
  // `;

  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  const [votingRounds, allDripLists, chainStats] = await Promise.all([
    !connectedAddress
      ? Promise.resolve([])
      : getVotingRounds({ publisherAddress: connectedAddress }, fetch),
    fetchDripLists(fetch),
    fetchChainStats(fetch),
    // query<DripListsPageQuery, DripListsPageQueryVariables>(
    //   dripListsPageQuery,
    //   { ownerAddress: null, chains: [network.gqlName] },
    //   fetch,
    // ),
    // fetchFeaturedDripLists(network.chainId, fetch),
    // await query<DripListsPageQuery, DripListsPageQueryVariables>(
    //   dripListsPageQuery,
    //   { ownerAddress: connectedAddress, chains: [network.gqlName] },
    //   fetch,
    // ),
  ]);

  // TODO: then filter them by owner address if we've got it?

  const votingRoundsWithResults = votingRounds.filter((v) => v.result);

  const votingRoundsSplits = await Promise.all(
    votingRoundsWithResults.map((v) => v.result && mapSplitsFromMultiplayerResults(v.result)),
  );

  const votingRoundsWithSplits = votingRounds.map((v) => ({
    ...v,
    splits: votingRoundsSplits[votingRoundsWithResults.findIndex((vR) => vR.id === v.id)] ?? [],
  }));

  // TODO: maybe just filter these out from all the drips lists, like with the rest of the drip lists
  const featuredDripLists = await fetchFeaturedDripLists(network.chainId, fetch, allDripLists);
  const yourDripLists = [];
  const restDripLists = [];
  for (const dripList of allDripLists) {
    if (dripList.owner.address === connectedAddress) {
      yourDripLists.push(dripList);
      continue;
    }

    restDripLists.push(dripList);
  }

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

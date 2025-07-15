import query from '$lib/graphql/dripsQL.js';
import { gql } from 'graphql-request';
import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from './+page.svelte';
import { getVotingRounds } from '$lib/utils/multiplayer';
import type {
  DripListsPageQuery,
  DripListsPageQueryVariables,
} from './__generated__/gql.generated';
// import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
import network from '$lib/stores/wallet/network';
import type { SplitsComponentSplitsReceiver } from '$lib/components/splits/types';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
import fetchFeaturedDripLists from '../components/load-drip-list';

type VotingRoundWithSplits = VotingRound & { splits: SplitsComponentSplitsReceiver[] };

const fetchedDataCache = makeFetchedDataCache<{
  dripLists: DripListsPageQuery['dripLists'];
  yourDripLists: DripListsPageQuery['dripLists'];
  restDripLists: DripListsPageQuery['dripLists'];
  featuredDripLists: Awaited<ReturnType<typeof fetchFeaturedDripLists>>;
  votingRounds: VotingRoundWithSplits[];
}>('dashboard:drip-lists');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  // if (!connectedAddress) {
  //   throw redirect(307, buildUrl('/app/connect', { backTo: '/app/drip-lists' }));
  // }

  const dripListsPageQuery = gql`
    ${DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT}
    query DripListsPage($ownerAddress: String, $chains: [SupportedChain!]) {
      dripLists(chains: $chains, where: { ownerAddress: $ownerAddress }) {
        ...DripListsPageDripList
      }
    }
  `;

  const locallyCached = fetchedDataCache.read();

  if (locallyCached) {
    return locallyCached;
  }

  // Oops we can't do either of these queries actually. But we also need to do a query for the
  // featured or whatever drip lists so we know what the fuck is going on!
  // so we just can't do this query if we're not connected to a wallet. So then, just return
  // something like an empty array or whatever
  const [votingRounds, dripListsRes, featuredDripLists] = await Promise.all([
    !connectedAddress
      ? Promise.resolve([])
      : getVotingRounds({ publisherAddress: connectedAddress }, fetch),
    query<DripListsPageQuery, DripListsPageQueryVariables>(
      dripListsPageQuery,
      { ownerAddress: null, chains: [network.gqlName] },
      fetch,
    ),
    fetchFeaturedDripLists(network.chainId, fetch),
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

  const yourDripLists = [];
  const restDripLists = [];
  for (const dripList of dripListsRes.dripLists) {
    if (dripList.owner.address === connectedAddress) {
      yourDripLists.push(dripList);
      continue;
    }

    restDripLists.push(dripList);
  }

  fetchedDataCache.write({
    dripLists: dripListsRes.dripLists,
    yourDripLists,
    restDripLists,
    featuredDripLists,
    votingRounds: votingRoundsWithSplits,
  });

  return {
    dripLists: dripListsRes.dripLists,
    yourDripLists,
    restDripLists,
    featuredDripLists,
    votingRounds: votingRoundsWithSplits,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

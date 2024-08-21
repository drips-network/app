import query from '$lib/graphql/dripsQL.js';
import { redirect } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from './+page.svelte';
import { getVotingRounds } from '$lib/utils/multiplayer';
import {
  mapSplitsFromMultiplayerResults,
  type SplitsComponentSplitsReceiver,
} from '$lib/components/splits/splits.svelte';
import type {
  DripListsPageQuery,
  DripListsPageQueryVariables,
} from './__generated__/gql.generated';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
import network from '$lib/stores/wallet/network';

type VotingRoundWithSplits = VotingRound & { splits: SplitsComponentSplitsReceiver[] };

const fetchedDataCache = makeFetchedDataCache<{
  dripLists: DripListsPageQuery['dripLists'];
  votingRounds: VotingRoundWithSplits[];
}>('dashboard:drip-lists');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    throw redirect(307, buildUrl('/app/connect', { backTo: '/app/drip-lists' }));
  }

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

  const [votingRounds, dripListsRes] = await Promise.all([
    await getVotingRounds({ publisherAddress: connectedAddress }, fetch),
    await query<DripListsPageQuery, DripListsPageQueryVariables>(
      dripListsPageQuery,
      { ownerAddress: connectedAddress, chains: [network.gqlName] },
      fetch,
    ),
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
    dripLists: dripListsRes.dripLists,
    votingRounds: votingRoundsWithSplits,
  });

  return { dripLists: dripListsRes.dripLists, votingRounds: votingRoundsWithSplits };
};

export const ssr = false;

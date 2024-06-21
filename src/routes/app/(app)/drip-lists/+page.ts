import query from '$lib/graphql/dripsQL.js';
import { error, redirect } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from './+page.svelte';
import { getVotingRounds } from '$lib/utils/multiplayer';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/splits.svelte';
import type {
  DripListsPageQuery,
  DripListsPageQueryVariables,
} from './__generated__/gql.generated';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/drip-lists' }));
  }

  const dripListsPageQuery = gql`
    ${DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT}
    query DripListsPage($ownerAddress: String) {
      dripLists(where: { ownerAddress: $ownerAddress }) {
        ...DripListsPageDripList
      }
    }
  `;

  const [votingRounds, dripListsRes] = await Promise.all([
    await getVotingRounds({ publisherAddress: connectedAddress }, fetch),
    await query<DripListsPageQuery, DripListsPageQueryVariables>(
      dripListsPageQuery,
      { ownerAddress: connectedAddress },
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

  if (!connectedAddress) {
    return error(401, 'Unauthorized');
  }

  return { dripLists: dripListsRes.dripLists, votingRounds: votingRoundsWithSplits };
};

export const ssr = false;

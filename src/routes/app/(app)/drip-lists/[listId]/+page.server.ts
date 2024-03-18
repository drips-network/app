import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { DRIP_LIST_PAGE_FRAGMENT } from './+page.svelte';
import * as multiplayer from '$lib/utils/multiplayer';

export const load = (async ({ params, fetch }) => {
  const { listId } = params;

  // If the ID is a UUID, we can assume it's a voting round ID
  const isVotingRoundId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listId);

  if (isVotingRoundId) {
    try {
      const votingRound = await multiplayer.getVotingRound(listId, fetch);

      // If the voting round has already been linked to a Drip List, we forward to the respective Drip List ID.
      if (votingRound?.dripListId) {
        return redirect(301, `/app/drip-lists/${votingRound.dripListId}`);
      }

      return {
        dripList: undefined,
        votingRound,
        incomingSplitsTotal: [],
        blockWhileInitializing: false,
      };
    } catch (e) {
      throw error(404);
    }
  }

  const dripListQuery = gql`
    ${DRIP_LIST_PAGE_FRAGMENT}
    query DripList($listId: ID!) {
      dripList(id: $listId) {
        ...DripListPage
      }
    }
  `;

  async function getVotingRoundForList(listId: string) {
    const res = await multiplayer.getVotingRounds({ dripListId: listId }, fetch);

    return multiplayer.matchVotingRoundToDripList(res, listId);
  }

  const fetches = await Promise.all([
    query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
    getVotingRoundForList(listId),
    getIncomingSplitTotal(listId),
  ] as const);

  if (!fetches[0]?.dripList && !fetches[1]) throw error(404);

  return {
    dripList: fetches[0].dripList,
    votingRound: fetches[1],
    incomingSplitsTotal: fetches[2],
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

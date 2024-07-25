import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { DRIP_LIST_PAGE_FRAGMENT } from './+page.svelte';
import * as multiplayer from '$lib/utils/multiplayer';
import type { VotingRound } from '$lib/utils/multiplayer/schemas';
import {
  mapSplitsFromMultiplayerResults,
  type SplitsComponentSplitsReceiver,
} from '$lib/components/splits/splits.svelte';

export const load = (async ({ params, fetch }) => {
  const { listId } = params;

  if (multiplayer.isVotingRoundId(listId)) {
    let votingRound: VotingRound & { splits?: SplitsComponentSplitsReceiver[] };
    try {
      const votingRoundRes = await multiplayer.getVotingRound(listId, fetch);

      if (!votingRoundRes) throw new Error();
      votingRound = votingRoundRes;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error(404);
    }

    // If the voting round has already been linked to a Drip List, we forward to the respective Drip List ID.
    if (votingRound.status === 'Linked') {
      redirect(301, `/app/drip-lists/${votingRound.dripListId}`);
    }

    if (votingRound.result) {
      votingRound.splits = await mapSplitsFromMultiplayerResults(votingRound.result, fetch);
    }

    return {
      dripList: undefined,
      votingRounds: { current: votingRound, past: [] },
      incomingSplitsTotal: [],
      blockWhileInitializing: false,
    };
  }

  // It's not a voting round ID, so it must be a (numeric) Drip List ID.
  if (!/^\d+$/.test(listId)) throw error(404);

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

    const currentVotingRound:
      | (VotingRound & { splits?: SplitsComponentSplitsReceiver[] })
      | undefined = multiplayer.matchVotingRoundToDripList(res, listId);

    if (currentVotingRound?.result) {
      currentVotingRound.splits = await mapSplitsFromMultiplayerResults(
        currentVotingRound.result,
        fetch,
      );
    }

    return {
      current: currentVotingRound,
      past: res.filter((v) => v.id !== currentVotingRound?.id),
    };
  }

  const fetches = await Promise.all([
    query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
    getVotingRoundForList(listId),
  ] as const);

  if (!fetches[0]?.dripList && !fetches[1].current) throw error(404);

  return {
    dripList: fetches[0].dripList,
    votingRounds: fetches[1],
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

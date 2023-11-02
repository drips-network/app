import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { SUPPORT_CARD_DRIP_LIST_FRAGMENT } from '$lib/components/support-card/support-card.svelte';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params, fetch }) => {
  const { listId } = params;

  const dripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    ${SUPPORT_CARD_DRIP_LIST_FRAGMENT}
    query DripList($listId: ID!) {
      dripList(id: $listId) {
        ...DripListCard
        ...SupportCardDripList
      }
    }
  `;

  const fetches = await Promise.all([
    query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
    getIncomingSplits(listId),
    getIncomingSplitTotal(listId),
  ] as const);

  if (!fetches[0]?.dripList) throw error(404);  

  return {
    dripList: fetches[0].dripList,
    incomingSplits: fetches[1],
    incomingSplitsTotal: fetches[2],
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

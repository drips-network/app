import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { DRIP_LIST_PAGE_FRAGMENT } from './+page.svelte';

export const load = (async ({ params, fetch }) => {
  const { listId } = params;

  const dripListQuery = gql`
    ${DRIP_LIST_PAGE_FRAGMENT}
    query DripList($listId: ID!) {
      dripList(id: $listId) {
        ...DripListPage
      }
    }
  `;

  const fetches = await Promise.all([
    query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
    getIncomingSplits(listId, fetch),
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

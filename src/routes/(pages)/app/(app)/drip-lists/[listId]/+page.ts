import { error } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { DRIP_LIST_PAGE_FRAGMENT } from './+page.svelte';
import network from '$lib/stores/wallet/network';

export const load = async ({ params, fetch }) => {
  const { listId } = params;

  if (!/^\d+$/.test(listId)) throw error(404);

  const dripListQuery = gql`
    ${DRIP_LIST_PAGE_FRAGMENT}
    query DripList($listId: ID!, $chain: SupportedChain!) {
      dripList(id: $listId, chain: $chain) {
        ...DripListPage
      }
    }
  `;

  const { dripList } = await query<DripListQuery, DripListQueryVariables>(
    dripListQuery,
    { listId, chain: network.gqlName },
    fetch,
  );

  if (!dripList) throw error(404);

  return {
    dripList,
    blockWhileInitializing: false,
    preservePathOnNetworkChange: false,
  };
};

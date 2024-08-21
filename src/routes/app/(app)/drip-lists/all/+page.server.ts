import type { PageServerLoad } from './$types';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListsQuery, DripListsQueryVariables } from './__generated__/gql.generated';
import { DRIP_LISTS_LISTINGS_ITEM_FRAGMENT } from './+page.svelte';
import network from '$lib/stores/wallet/network';

export const load = (async ({ fetch }) => {
  const dripListsQuery = gql`
    ${DRIP_LISTS_LISTINGS_ITEM_FRAGMENT}
    query DripLists($chains: [SupportedChain!]!) {
      dripLists(chains: $chains) {
        ...DripListsListingsItem
      }
    }
  `;

  return {
    content: await query<DripListsQuery, DripListsQueryVariables>(
      dripListsQuery,
      { chains: [network.gqlName] },
      fetch,
    ),
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

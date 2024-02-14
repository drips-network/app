import type { PageServerLoad } from './$types';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListsQuery, DripListsQueryVariables } from './__generated__/gql.generated';
import { DRIP_LISTS_LISTINGS_ITEM_FRAGMENT } from './+page.svelte';

export const load = (async ({ fetch }) => {
  const dripListsQuery = gql`
    ${DRIP_LISTS_LISTINGS_ITEM_FRAGMENT}
    query DripLists {
      dripLists {
        ...DripListsListingsItem
      }
    }
  `;

  return {
    content: await query<DripListsQuery, DripListsQueryVariables>(dripListsQuery, {}, fetch),
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

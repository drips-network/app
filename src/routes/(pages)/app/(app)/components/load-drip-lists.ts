import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type { AllDripListsQuery, AllDripListsQueryVariables } from './__generated__/gql.generated';
import {
  DripListSortField,
  SortDirection,
  type QueryDripListsArgs,
} from '$lib/graphql/__generated__/base-types';

export const DRIP_LISTS_FRAGMENT = gql`
  ${DRIP_LIST_CARD_FRAGMENT}
  fragment DripLists on DripList {
    ...DripListCard
  }
`;

export const dripListsQuery = gql`
  ${DRIP_LISTS_FRAGMENT}
  query AllDripLists(
    $where: DripListWhereInput
    $sort: DripListSortInput
    $chains: [SupportedChain!]
    $limit: Int
  ) {
    dripLists(where: $where, sort: $sort, chains: $chains, limit: $limit) {
      ...DripLists
    }
  }
`;

export function createDefaultFetchDripListsParameters(): QueryDripListsArgs {
  return {
    where: undefined,
    sort: { direction: SortDirection.Asc, field: DripListSortField.MintedAt },
    chains: [network.gqlName],
    limit: undefined,
  };
}

export async function fetchDripLists(f: typeof fetch, dripListsParameters?: QueryDripListsArgs) {
  if (!dripListsParameters) {
    dripListsParameters = createDefaultFetchDripListsParameters();
  }

  const res = await query<AllDripListsQuery, AllDripListsQueryVariables>(
    dripListsQuery,
    dripListsParameters,
    f,
  );

  return res.dripLists;
}

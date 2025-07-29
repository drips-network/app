import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type { DripListsQuery, DripListsQueryVariables } from './__generated__/gql.generated';
import {
  DripListSortField,
  SortDirection,
  type DripListSortInput,
  type DripListWhereInput,
  type SupportedChain,
} from '$lib/graphql/__generated__/base-types';

export const DRIP_LISTS_FRAGMENT = gql`
  ${DRIP_LIST_CARD_FRAGMENT}
  fragment DripLists on DripList {
    ...DripListCard
  }
`;

export const dripListsQuery = gql`
  ${DRIP_LISTS_FRAGMENT}
  query DripLists(
    $where: DripListWhereInput
    $sort: DripListSortInput
    $chains: [SupportedChain!]!
  ) {
    dripLists(where: $where, sort: $sort, chains: $chains) {
      ...DripLists
    }
  }
`;

type DripListsParameters = {
  where: DripListWhereInput | null;
  sort: DripListSortInput;
  chains: SupportedChain[];
};

export function createFetchDripListsParameters(): DripListsParameters {
  return {
    where: null,
    sort: { direction: SortDirection.Asc, field: DripListSortField.MintedAt },
    chains: [network.gqlName],
  };
}

export async function fetchLists(f: typeof fetch, dripListsParameters?: DripListsParameters) {
  if (!dripListsParameters) {
    dripListsParameters = createFetchDripListsParameters();
  }

  const res = await query<DripListsQuery, DripListsQueryVariables>(
    dripListsQuery,
    dripListsParameters,
    f,
  );

  return res.dripLists;
}

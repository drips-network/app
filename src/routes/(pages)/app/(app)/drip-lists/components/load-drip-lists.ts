import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import {
  DripListSortField,
  SortDirection,
  type QueryDripListsArgs,
} from '$lib/graphql/__generated__/base-types';
import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import FEATURED_DRIP_LISTS_CONFIG from './featured-drip-lists-config';
import type {
  AllDripListsQuery,
  AllDripListsQueryVariables,
  DripListQuery,
  DripListQueryVariables,
} from './__generated__/gql.generated';

export const DRIP_LIST_FRAGMENT = gql`
  ${DRIP_LIST_CARD_FRAGMENT}
  fragment DripList on DripList {
    ...DripListCard
  }
`;

export const dripListQuery = gql`
  ${DRIP_LIST_FRAGMENT}
  query DripList($id: ID!, $chain: SupportedChain!) {
    dripList(id: $id, chain: $chain) {
      ...DripList
    }
  }
`;

export const dripListsQuery = gql`
  ${DRIP_LIST_FRAGMENT}
  query AllDripLists(
    $where: DripListWhereInput
    $sort: DripListSortInput
    $chains: [SupportedChain!]
    $limit: Int
  ) {
    dripLists(where: $where, sort: $sort, chains: $chains, limit: $limit) {
      ...DripList
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

export async function fetchDripList(id: string, f: typeof fetch) {
  const res = await query<DripListQuery, DripListQueryVariables>(
    dripListQuery,
    { id, chain: network.gqlName },
    f,
  );

  return res.dripList;
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

export async function fetchFeaturedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
) {
  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[chainId]?.featuredDripListIds ?? [];
  return Promise.all(featuredDripListIds.map(async (id) => fetchDripList(id, f)));
}

export default async function fetchAndCategorizeDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  connectedAddress?: string,
  dripLitsParameters?: QueryDripListsArgs,
) {
  const dripLists = await fetchDripLists(f, dripLitsParameters);

  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[chainId]?.featuredDripListIds ?? [];

  const yourDripLists = [];
  const featuredDripLists = [];
  const restDripLists = [];
  for (const dripList of dripLists) {
    if (dripList.owner.address === connectedAddress) {
      yourDripLists.push(dripList);
    }

    if (featuredDripListIds.includes(dripList.account.accountId)) {
      featuredDripLists.push(dripList);
      continue;
    }

    restDripLists.push(dripList);
  }

  return {
    featuredDripLists,
    yourDripLists,
    restDripLists,
  };
}

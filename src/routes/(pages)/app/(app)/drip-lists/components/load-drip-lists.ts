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
  fragment ADripList on DripList {
    ...DripListCard
  }
`;

export const dripListQuery = gql`
  ${DRIP_LIST_FRAGMENT}
  query DripList($id: ID!, $chain: SupportedChain!) {
    dripList(id: $id, chain: $chain) {
      ...ADripList
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
      ...ADripList
    }
  }
`;

export function createDefaultFetchDripListsParameters(): QueryDripListsArgs {
  return {
    where: undefined,
    sort: { direction: SortDirection.Desc, field: DripListSortField.MintedAt },
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

async function fetchOwnDripLists(f: typeof fetch, connectedAddress?: string) {
  if (!connectedAddress) {
    return [];
  }

  const defaultParameters = createDefaultFetchDripListsParameters();
  const parameters = Object.assign({}, defaultParameters, {
    where: { ownerAddress: connectedAddress },
  });
  return fetchDripLists(f, parameters);
}

export async function fetchFeaturedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
) {
  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[chainId]?.featuredDripListIds ?? [];
  return Promise.all(featuredDripListIds.map(async (id) => fetchDripList(id, f)));
}

async function fetchRecentDripLists(f: typeof fetch) {
  const defaultParameters = createDefaultFetchDripListsParameters();
  const parameters = Object.assign({}, defaultParameters, { limit: 8 });
  return fetchDripLists(f, parameters);
}

export default async function fetchCategorziedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  connectedAddress?: string,
) {
  const [yourDripLists, featuredDripLists, restDripLists] = await Promise.all([
    fetchOwnDripLists(f, connectedAddress),
    fetchFeaturedDripLists(chainId, f),
    fetchRecentDripLists(f),
  ]);

  return {
    featuredDripLists,
    yourDripLists,
    restDripLists,
  };
}

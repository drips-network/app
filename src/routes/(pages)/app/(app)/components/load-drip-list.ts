import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type {
  FeaturedDripListQuery,
  FeaturedDripListQueryVariables,
} from './__generated__/gql.generated';

export const EXPLORE_PAGE_FEATURED_DRIP_LISTS_FRAGMENT = gql`
  ${DRIP_LIST_CARD_FRAGMENT}
  fragment ExplorePageFeaturedDripLists on DripList {
    ...DripListCard
  }
`;

export const featuredDripListQuery = gql`
  ${EXPLORE_PAGE_FEATURED_DRIP_LISTS_FRAGMENT}
  query FeaturedDripList($id: ID!, $chain: SupportedChain!) {
    dripList(id: $id, chain: $chain) {
      ...ExplorePageFeaturedDripLists
    }
  }
`;

export async function fetchList(id: string, f: typeof fetch) {
  const res = await query<FeaturedDripListQuery, FeaturedDripListQueryVariables>(
    featuredDripListQuery,
    { id, chain: network.gqlName },
    f,
  );

  return res.dripList;
}

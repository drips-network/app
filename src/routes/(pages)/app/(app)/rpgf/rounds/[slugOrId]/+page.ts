import { gql } from 'graphql-request';
import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from '../../../drip-lists/+page.svelte';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import type {
  RpgfLinkedDripListQuery,
  RpgfLinkedDripListQueryVariables,
} from './__generated__/gql.generated';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';

export const load = async ({ parent }) => {
  const { round } = await parent();

  const { linkedDripLists } = round;

  async function fetchLists(
    listIds: string[],
  ): Promise<NonNullable<RpgfLinkedDripListQuery['dripList']>[]> {
    const listQuery = gql`
      ${DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT}
      query RpgfLinkedDripList($id: ID!, $chain: SupportedChain!) {
        dripList(id: $id, chain: $chain) {
          ...DripListsPageDripList
        }
      }
    `;

    return mapFilterUndefined(
      await Promise.all(
        listIds.map((list) =>
          query<RpgfLinkedDripListQuery, RpgfLinkedDripListQueryVariables>(
            listQuery,
            { id: list, chain: network.gqlName },
            fetch,
          ),
        ),
      ),
      (v) => v.dripList,
    );
  }

  return { linkedDripLists: await fetchLists(linkedDripLists), blockWhileInitializing: false };
};

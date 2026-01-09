import { gql } from 'graphql-request';
import { DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT } from '../../../drip-lists/+page.svelte';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import type {
  RpgfLinkedDripListQuery,
  RpgfLinkedDripListQueryVariables,
} from './__generated__/gql.generated';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { getApplications } from '$lib/utils/rpgf/rpgf';

export const load = async ({ parent, depends, fetch }) => {
  depends('rpgf:round:linkedDripLists');
  depends('rpgf:round:applications');

  const { round } = await parent();

  const { linkedDripLists: linkedDripListsIds } = round;

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

  const [linkedDripLists, fiveApplications] = await Promise.all([
    fetchLists(linkedDripListsIds ?? []),
    getApplications(
      fetch,
      round.id,
      5,
      0,
      round.resultsPublished ? 'allocation:desc' : 'createdAt:desc',
    ),
  ]);

  return { fiveApplications, linkedDripLists, blockWhileInitializing: false };
};

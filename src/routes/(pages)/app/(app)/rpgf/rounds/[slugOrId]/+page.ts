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

const APPLICATIONS_PREVIEW_TIMEOUT_MS = 10_000;

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

  // The applications preview is non-essential. If the RPGF API is slow or failing, render the
  // round page without it instead of hanging the whole SSR load (undici waits up to 300s for
  // headers by default) and ultimately failing the page.
  async function fetchFiveApplications() {
    const fetchWithTimeout: typeof fetch = (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(APPLICATIONS_PREVIEW_TIMEOUT_MS) });

    try {
      return await getApplications(
        fetchWithTimeout,
        round.id,
        5,
        0,
        round.resultsPublished ? 'allocation:desc' : 'createdAt:desc',
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load applications preview for RPGF round', round.id, e);
      return null;
    }
  }

  const [linkedDripLists, fiveApplications] = await Promise.all([
    fetchLists(linkedDripListsIds ?? []),
    fetchFiveApplications(),
  ]);

  return { fiveApplications, linkedDripLists, blockWhileInitializing: false };
};

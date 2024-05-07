import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { gql } from 'graphql-request';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';
import query from '$lib/graphql/dripsQL';
import type {
  DripListQuery,
  DripListQueryVariables,
} from './app/(app)/drip-lists/[listId]/__generated__/gql.generated';

export const load = (async ({ fetch }) => {
  const prices = await cachedTotalDrippedPrices(redis, fetch);

  const featuredDripListIds = [
    // '50330452048867519181028275890986093327647919805766323166158196453514', // Radworks
    '48495160997488293670723292622742268320163565037397170198477469637178', // Drips Deps
  ];

  const dripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    query DripList($listId: ID!) {
      dripList(id: $listId) {
        ...DripListCard
      }
    }
  `;

  const dripLists = await Promise.all(
    featuredDripListIds.map((listId) =>
      query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
    ),
  );

  return {
    dripLists,
    prices,
  };
}) satisfies PageServerLoad;

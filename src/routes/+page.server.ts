import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { gql } from 'graphql-request';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { PUBLIC_NETWORK } from '$env/static/public';

export const load = (async ({ fetch }) => {
  const prices = await cachedTotalDrippedPrices(redis, fetch);

  const featuredDripListIds =
    {
      1: [
        // '48495160997488293670723292622742268320163565037397170198477469637178', // Drips Deps
        // '50330452048867519181028275890986093327647919805766323166158196453514', // Radworks
        // '34625983682950977210847096367816372822461201185275535522726531049130', // Radicle Deps
        '30178668158349445547603108732480118476541651095408979232800331391215', // Octant Deps
      ],
      11155111: [
        '36769033273185855619354143893112184428678889586240920383305166372634', // Test Drip List Vote
      ],
    }[PUBLIC_NETWORK] ?? [];

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

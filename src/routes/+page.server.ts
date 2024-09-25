import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redirect } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import type { PageServerLoad } from './$types';
import { redis } from './api/redis';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import { PUBLIC_NETWORK } from '$env/static/public';

const FEATURED_DRIP_LISTS =
  {
    1: [
      '31017209032870028068280040871339261037749177808773684797297972107972',
      '34625983682950977210847096367816372822461201185275535522726531049130',
      '30178668158349445547603108732480118476541651095408979232800331391215',
      '36167722434539895740687283110259945938004377627588501179309095983174',
    ],
    5: [
      '43105784259047059587622297205437858441071428120535676155904083617631',
      '28481327705385486963944368236369218710166051344540861155364610214366',
    ],
  }[PUBLIC_NETWORK] ?? [];

export const load = (async ({ fetch, request }) => {
  const isIframe = request.headers.get('Sec-Fetch-Dest') === 'iframe';
  if (isIframe) {
    // Only valid use for iFrame is running the app as a Safe App within the Safe UI.
    // In that case, we want to skip the LP and go straight to the app, which will then try
    // to auto-connect the Safe.
    return redirect(307, '/app');
  }

  const dripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    query DripList($listId: ID!) {
      dripList(id: $listId) {
        ...DripListCard
      }
    }
  `;

  const fetchFeaturedLists = async (): Promise<NonNullable<DripListQuery['dripList']>[]> => {
    const results = await Promise.all(
      FEATURED_DRIP_LISTS.map((listId) =>
        query<DripListQuery, DripListQueryVariables>(dripListQuery, { listId }, fetch),
      ),
    );

    return results
      .map((v) => v.dripList)
      .filter((v): v is NonNullable<DripListQuery['dripList']> => !!v);
  };

  const [dripLists, prices] = await Promise.all([
    fetchFeaturedLists(),
    cachedTotalDrippedPrices(redis, fetch),
  ]);

  return {
    dripLists,
    prices,
  };
}) satisfies PageServerLoad;

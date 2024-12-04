import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redis } from '../api/redis';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import query from '$lib/graphql/dripsQL';
import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import { gql } from 'graphql-request';
import { PUBLIC_NETWORK } from '$env/static/public';
import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts';

const FEATURED_DRIP_LISTS =
  {
    1: [
      '31017209032870028068280040871339261037749177808773684797297972107972',
      '41971962915943119138973997144514496143454239023249281594792952267407',
      '30178668158349445547603108732480118476541651095408979232800331391215',
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

  // TODO: Remove when we go full multi-chain.
  if (network.alternativeChainMode) {
    return redirect(308, '/app');
  }

  const dripListQuery = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    query DripList($listId: ID!, $chain: SupportedChain!) {
      dripList(id: $listId, chain: $chain) {
        account {
          accountId
        }
        ...DripListCard
      }
    }
  `;

  const fetchFeaturedLists = async (): Promise<
    Record<string, NonNullable<DripListQuery['dripList']>>
  > => {
    const results = await Promise.all(
      FEATURED_DRIP_LISTS.map((listId) =>
        query<DripListQuery, DripListQueryVariables>(
          dripListQuery,
          { listId, chain: network.gqlName },
          fetch,
        ),
      ),
    );

    return Object.fromEntries(
      results
        .map((v) => v.dripList)
        .filter((v): v is NonNullable<DripListQuery['dripList']> => !!v)
        .map((v) => [v.account.accountId, v]),
    );
  };

  const [prices, featuredLists, blogPosts] = await Promise.all([
    cachedTotalDrippedPrices(redis, fetch),
    fetchFeaturedLists(),
    fetchBlogPosts(),
  ]);

  return {
    prices,
    blogPosts,
    featuredLists,
  };
}) satisfies PageServerLoad;

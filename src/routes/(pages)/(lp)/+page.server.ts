import { redirect } from '@sveltejs/kit';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import query from '$lib/graphql/dripsQL';
import { DRIP_LIST_CARD_FRAGMENT } from '$lib/components/drip-list-card/drip-list-card.svelte';
import { gql } from 'graphql-request';
import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts';
import { SupportedChain } from '$lib/graphql/__generated__/base-types';
import cached from '$lib/utils/cache/remote/cached';
import { redis } from '../../api/redis';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';

const FEATURED_DRIP_LISTS: { accountId: string; chain: SupportedChain }[] =
  {
    1: [
      {
        accountId: '31017209032870028068280040871339261037749177808773684797297972107972',
        chain: SupportedChain.Mainnet,
      }, // ENS
      {
        accountId: '41971962915943119138973997144514496143454239023249281594792952267407',
        chain: SupportedChain.Mainnet,
      }, // Scroll
      {
        accountId: '45193817480599985262554974973835763972521255481357121508020698376704',
        chain: SupportedChain.Filecoin,
      }, // Filecoin
    ],
  }[network.chainId as number] ?? [];

export const load = async ({ fetch, request }) => {
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
      FEATURED_DRIP_LISTS.map(({ accountId, chain }) =>
        query<DripListQuery, DripListQueryVariables>(
          dripListQuery,
          { listId: accountId, chain },
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

  const [featuredLists, blogPosts] = await cached(
    redis,
    queryCacheKey(dripListQuery, JSON.stringify(FEATURED_DRIP_LISTS), 'homepage'),
    60 * 60 * 6,
    () => Promise.all([fetchFeaturedLists(), fetchBlogPosts()]),
  );

  return {
    blogPosts,
    featuredLists,
  };
};

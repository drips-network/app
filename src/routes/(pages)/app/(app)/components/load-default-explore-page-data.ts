import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import cached from '$lib/utils/cache/remote/cached';
import FEATURED_DRIP_LISTS_CONFIG from '../drip-lists/components/featured-drip-lists-config';
import type { ExplorePageVariant } from './explore-page-config';
import { dripListQuery, fetchFeaturedDripLists } from '../drip-lists/components/load-drip-lists';
import {
  createDefaultFetchProjectsParameters,
  fetchAndCategorizeProjects,
  fetchProjectsQuery,
} from '../projects/components/load-projects';
import { redis } from '../../../../api/redis';

export default async function loadDefaultExplorePage(fetch: typeof global.fetch) {
  const fetchProjectsParameters = createDefaultFetchProjectsParameters();
  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[network.chainId].featuredDripListIds || [];

  const cacheKey = queryCacheKey(
    fetchProjectsQuery + dripListQuery,
    [Object.entries(fetchProjectsParameters), featuredDripListIds],
    'explore-page',
  );

  const [{ featuredProjects, featuredWeb3Projects, restProjects }, featuredDripLists, blogPosts] =
    await cached(
      redis,
      cacheKey,
      1 * 60 * 60, // 1 hr
      async () =>
        Promise.all([
          fetchAndCategorizeProjects(network.chainId, fetch),
          fetchFeaturedDripLists(network.chainId, fetch),
          fetchBlogPosts(),
        ]),
    );

  return {
    variant: 'default' as ExplorePageVariant,
    data: {
      projects: restProjects,
      featuredProjects,
      featuredWeb3Projects,
      featuredDripLists,
      blogPosts,
      blockWhileInitializing: false,
    },
  };
}

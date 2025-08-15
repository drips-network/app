import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts.js';
import {
  createDefaultFetchProjectsParameters,
  fetchProjects,
  fetchProjectsQuery,
} from '../projects/components/load-projects.js';
import {
  dripListsQuery,
  fetchFeaturedDripLists,
} from '../drip-lists/components/load-drip-lists.js';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key.js';
import cached from '$lib/utils/cache/remote/cached.js';
import FEATURED_DRIP_LISTS_CONFIG from '../drip-lists/components/featured-drip-lists-config.js';
import EXPLORE_PAGE_CONFIG, { type ExplorePageVariant } from './explore-page-config.js';
import { redis } from '../../../../api/redis.js';

export default async function loadDistributionExplorePage(fetch: typeof global.fetch) {
  const currentConfig = EXPLORE_PAGE_CONFIG[network.chainId];
  const { welcomeCardConfig, showRecentProjects } = currentConfig;

  const fetchProjectsParameters = createDefaultFetchProjectsParameters();
  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[network.chainId].featuredDripListIds || [];

  const cacheKey = queryCacheKey(
    fetchProjectsQuery + dripListsQuery,
    [Object.entries(fetchProjectsParameters), featuredDripListIds],
    'explore-page',
  );

  const [projects, featuredDripLists, blogPosts] = await cached(
    redis,
    cacheKey,
    1 * 60 * 60, // 1 hr
    async () =>
      Promise.all([
        showRecentProjects ? fetchProjects(fetch) : null,
        fetchFeaturedDripLists(network.chainId, fetch),
        fetchBlogPosts(),
      ]),
  );

  return {
    variant: 'distribution' as ExplorePageVariant,
    data: {
      projects,
      featuredDripLists,
      blogPosts,
      welcomeCardConfig,
    },
  };
}

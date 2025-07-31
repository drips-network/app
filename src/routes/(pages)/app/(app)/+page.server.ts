import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts.js';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx.js';
import fetchTlv from './components/load-tlv.js';
import { redis } from '../../../api/redis.js';
import {
  createDefaultFetchProjectsParameters,
  fetchAndCategorizeProjects,
  fetchProjects,
  fetchProjectsQuery,
} from './projects/components/load-projects.js';
import fetchFeaturedDripLists, { dripListsQuery } from './drip-lists/components/load-drip-lists.js';
import EXPLORE_PAGE_CONFIG, { type ExplorePageVariant } from './components/explore-page-config.js';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key.js';
import FEATURED_DRIP_LISTS_CONFIG from './drip-lists/components/featured-drip-lists-config.js';
import cached from '$lib/utils/cache/remote/cached.js';

const loadDefaultExplorePage = async (fetch: typeof global.fetch) => {
  const fetchProjectsParameters = createDefaultFetchProjectsParameters();
  const featuredDripListIds = FEATURED_DRIP_LISTS_CONFIG[network.chainId].featuredDripListIds || [];

  const cacheKey = queryCacheKey(
    fetchProjectsQuery + dripListsQuery,
    [Object.entries(fetchProjectsParameters), featuredDripListIds],
    'explore-page',
  );

  const [
    { featuredProjects, featuredWeb3Projects, restProjects },
    featuredDripLists,
    blogPosts,
    totalDrippedPrices,
    tlv,
  ] = await cached(
    redis,
    cacheKey,
    1 * 60 * 60, // 1 hr
    async () =>
      Promise.all([
        fetchAndCategorizeProjects(network.chainId, fetch),
        fetchFeaturedDripLists(network.chainId, fetch),
        fetchBlogPosts(),
        cachedTotalDrippedPrices(redis, fetch),
        fetchTlv(fetch),
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
      totalDrippedPrices,
      tlv,
      blockWhileInitializing: false,
    },
  };
};

const loadDistributionExplorePage = async (fetch: typeof global.fetch) => {
  const currentConfig = EXPLORE_PAGE_CONFIG[network.chainId];
  const showRecentProjects = currentConfig.showRecentProjects;
  const welcomeCardConfig = currentConfig.welcomeCardConfig;

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
};

export const load = async ({ fetch }) => {
  const explorePageVariant = EXPLORE_PAGE_CONFIG[network.chainId].variant;
  switch (explorePageVariant) {
    case 'distribution':
      return loadDistributionExplorePage(fetch);
    default:
      return loadDefaultExplorePage(fetch);
  }
};

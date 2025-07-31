import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts.js';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx.js';
import fetchTlv from './components/load-tlv.js';
import { redis } from '../../../api/redis.js';
import { fetchAndCategorizeProjects, fetchProjects } from './projects/components/load-projects.js';
import fetchFeaturedDripLists from './drip-lists/components/load-drip-lists.js';
import EXPLORE_PAGE_CONFIG, { type ExplorePageVariant } from './components/explore-page-config.js';

const loadDefaultExplorePage = async (fetch: typeof global.fetch) => {
  const [
    { featuredProjects, featuredWeb3Projects, restProjects },
    featuredDripLists,
    blogPosts,
    totalDrippedPrices,
    tlv,
  ] = await Promise.all([
    fetchAndCategorizeProjects(network.chainId, fetch),
    fetchFeaturedDripLists(network.chainId, fetch),
    fetchBlogPosts(),
    cachedTotalDrippedPrices(redis, fetch),
    fetchTlv(fetch),
  ]);

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
    },
  };
};
const loadDistributionExplorePage = async (fetch: typeof global.fetch) => {
  const currentConfig = EXPLORE_PAGE_CONFIG[network.chainId];
  const showRecentProjects = currentConfig.showRecentProjects;
  const welcomeCardConfig = currentConfig.welcomeCardConfig;

  const [projects, featuredDripLists, blogPosts] = await Promise.all([
    showRecentProjects ? fetchProjects(fetch) : null,
    fetchFeaturedDripLists(network.chainId, fetch),
    fetchBlogPosts(),
  ]);

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

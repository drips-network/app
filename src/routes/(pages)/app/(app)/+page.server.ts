import network from '$lib/stores/wallet/network';
import { fetchBlogPosts } from '$lib/utils/blog-posts.js';
import { cachedTotalDrippedPrices } from '$lib/utils/total-dripped-approx.js';
import fetchTlv from './components/load-tlv.js';
import fetchPageVariant from './components/load-page-variant.js';
import { redis } from '../../../api/redis.js';
import fetchWelcomeCardConfig from './components/load-welcomecard-config.js';
import { fetchAndCategorizeProjects } from './projects/components/load-projects.js';
import fetchFeaturedDripLists from './drip-lists/components/load-drip-lists.js';

export const load = async ({ fetch }) => {
  // TODO: don't load all this stuff for the distribution page, switch with variant
  const [
    { featuredProjects, featuredWeb3Projects, restProjects },
    featuredDripLists,
    blogPosts,
    totalDrippedPrices,
    tlv,
    variant,
    welcomeCardConfig,
  ] = await Promise.all([
    fetchAndCategorizeProjects(network.chainId, fetch),
    fetchFeaturedDripLists(network.chainId, fetch),
    fetchBlogPosts(),
    cachedTotalDrippedPrices(redis, fetch),
    fetchTlv(fetch),
    fetchPageVariant(network.chainId),
    fetchWelcomeCardConfig(network.chainId),
  ]);

  return {
    variant,
    data: {
      projects: restProjects,
      featuredProjects,
      featuredWeb3Projects,
      featuredDripLists,
      blogPosts,
      totalDrippedPrices,
      tlv,
      welcomeCardConfig,
    },
  };
};

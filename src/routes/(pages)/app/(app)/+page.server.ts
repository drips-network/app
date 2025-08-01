import network from '$lib/stores/wallet/network';
import EXPLORE_PAGE_CONFIG from './components/explore-page-config.js';
import loadDefaultExplorePage from './components/load-default-explore-page-data.js';
import loadDistributionExplorePage from './components/load-distribution-explore-page-data.js';

export const load = async ({ fetch }) => {
  const explorePageVariant = EXPLORE_PAGE_CONFIG[network.chainId].variant;
  switch (explorePageVariant) {
    case 'distribution':
      return loadDistributionExplorePage(fetch);
    default:
      return loadDefaultExplorePage(fetch);
  }
};

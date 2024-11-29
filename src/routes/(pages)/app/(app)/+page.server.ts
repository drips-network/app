import network from '$lib/stores/wallet/network';
import loadDefaultExplorePageData from './components/load-default-explore-page-data';
import loadFilecoinExporePageData from './components/load-filecoin-explore-page-data';

export const load = async ({ fetch }) => {
  switch (network.chainId) {
    case 314: {
      return {
        explorePageVersion: 'filecoin' as const,
        ...(await loadFilecoinExporePageData(fetch)),
      };
    }
    default: {
      return {
        explorePageVersion: 'default' as const,
        ...(await loadDefaultExplorePageData(fetch)),
      };
    }
  }
};

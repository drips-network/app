import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import type { ExplorePageVariant } from './explore-page-config';
import EXPLORE_PAGE_CONFIG from './explore-page-config';

export default function fetchPageVariant(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
): ExplorePageVariant {
  return EXPLORE_PAGE_CONFIG[chainId].variant;
}

import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import type { ExplorePageConfig } from './explore-page-config';
import EXPLORE_PAGE_CONFIG from './explore-page-config';

export default function fetchWelcomeCardConfig(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
): ExplorePageConfig['welcomeCardConfig'] | undefined {
  return EXPLORE_PAGE_CONFIG[chainId].welcomeCardConfig;
}

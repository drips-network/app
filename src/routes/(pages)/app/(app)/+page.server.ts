import network, { type ValueForEachSupportedChain } from '$lib/stores/wallet/network';
import loadDefaultExplorePageData from './components/load-default-explore-page-data.js';
import loadDistributionExplorePageData from './components/load-distribution-explore-page-data.js';
import type { EXPLORE_PAGE_VARIANT_COMPONENTS } from './+page.svelte';

type ExplorePageVariantComponents = typeof EXPLORE_PAGE_VARIANT_COMPONENTS;
type ExplorePageVariant = keyof ExplorePageVariantComponents;

type ExplorePageConfig = {
  variant: ExplorePageVariant;
  loadFn: (f: typeof fetch) => Promise<Record<string, unknown>>;
};

const defaultExplorePageConfig = {
  variant: 'default',
  loadFn: loadDefaultExplorePageData,
} as const;

const distributionExplorePageConfig = (
  config: Parameters<typeof loadDistributionExplorePageData>[1],
) =>
  ({
    variant: 'distribution',
    loadFn: (f: typeof fetch) => loadDistributionExplorePageData(f, config),
  }) as const;

const EXPLORE_PAGE_CONFIG: ValueForEachSupportedChain<ExplorePageConfig> = {
  1: defaultExplorePageConfig,
  80002: defaultExplorePageConfig,
  11155420: defaultExplorePageConfig,
  11155111: defaultExplorePageConfig,
  31337: defaultExplorePageConfig,
  84532: defaultExplorePageConfig,
  314: distributionExplorePageConfig({
    featuredListId: '45193817480599985262554974973835763972521255481357121508020698376704',
    welcomeCardConfig: {
      title: 'Welcome to Drips on Filecoin',
      description:
        "Drips on Filecoin is where rewards from Filecoin's RetroPGF are being distributed.",
      docsButton: {
        label: 'Read the FIL-RetroPGF-2 docs',
        href: 'https://fil-retropgf.notion.site/FIL-RetroPGF-4b6f5358440043c8bb1bf53f0297541e',
      },
    },
    showRecentProjects: true,
  }),
  1088: distributionExplorePageConfig({
    featuredListId: null,
    welcomeCardConfig: {
      title: 'Welcome to Drips on Metis',
      description: "Drips on Filecoin is where rewards from Metis' RetroPGF will be distributed.",
    },
  }),
} as const;

export const load = async ({ fetch }) => {
  const explorePageConfig = EXPLORE_PAGE_CONFIG[network.chainId];

  return {
    variant: explorePageConfig.variant,
    data: await explorePageConfig.loadFn(fetch),
  };
};

import type { ValueForEachSupportedChain } from '$lib/stores/wallet/network';
import type { ComponentProps } from 'svelte';
import type { EXPLORE_PAGE_VARIANT_COMPONENTS } from '../+page.svelte';
import type DistributionExplorePage from './distribution-explore-page.svelte';

type ExplorePageVariantComponents = typeof EXPLORE_PAGE_VARIANT_COMPONENTS;
export type ExplorePageVariant = keyof ExplorePageVariantComponents;

type PageProps = ComponentProps<DistributionExplorePage>;

export type ExplorePageConfig = {
  variant: ExplorePageVariant;
  welcomeCardConfig?: PageProps['welcomeCardConfig'];
  showRecentProjects?: boolean;
  featuredRpgfRoundIds?: string[];
};

const EXPLORE_PAGE_CONFIG: ValueForEachSupportedChain<ExplorePageConfig> = {
  1: {
    variant: 'default',
  },
  80002: { variant: 'default' },
  11155420: { variant: 'default' },
  11155111: { variant: 'default' },
  31337: { variant: 'default' },
  84532: { variant: 'default' },
  314: {
    variant: 'distribution',
    welcomeCardConfig: {
      title: 'Welcome to Drips on Filecoin',
      description: "Drips on Filecoin is the home for Filecoin's RetroPGF program.",
      docsButton: {
        label: 'Learn more about FIL-RPGF',
        href: 'https://fil-retropgf.io',
      },
    },
    showRecentProjects: true,
    featuredRpgfRoundIds: [
      'e35f0fdf-4cba-4620-be48-8ad669c22921', // test round (staging only)
    ],
  },
  1088: {
    variant: 'distribution',
    welcomeCardConfig: {
      title: 'Welcome to Drips on Metis',
      description: "Drips on Metis is where rewards from Metis' RetroPGF are being distributed.",
    },
  },
  10: {
    variant: 'default',
  },
} as const;

export default EXPLORE_PAGE_CONFIG;

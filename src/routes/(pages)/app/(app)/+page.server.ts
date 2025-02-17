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

const EXPLORE_PAGE_CONFIG: ValueForEachSupportedChain<ExplorePageConfig> = {
  1: {
    variant: 'default',
    loadFn: (f) =>
      loadDefaultExplorePageData(f, {
        featuredDripListIds: [
          '31017209032870028068280040871339261037749177808773684797297972107972', // ENS Ecosystem Term 5 Grant
          '34625983682950977210847096367816372822461201185275535522726531049130', // Radicle Dependencies
          '30178668158349445547603108732480118476541651095408979232800331391215', // Octant Dependencies
          '36167722434539895740687283110259945938004377627588501179309095983174', // Funding the Commons Builder Basic Income
        ],
        featuredWeb3ProjectIds: [
          '80921576051643469277397866636792942368647018452892810554457309839360', // ethers.js
          '80928956806149918791864723629668437820661066502202314166815319654400', // wagmi
          '80989205010981758696261160004449877944077887004065826078532843448906', // openzeppelin-contracts
          '80921140646830818724035150101819719966329403614944137690624336855040', // typechain
          '80921576051643464144625531318112867710912704239101372541354551279616', // web3.py
          '80927335273972468167722947750338907267861671542981060844246982983680', // starknet.js
          '80927325632295926773992520689210905998818993360029926329589912567808', // snapshot
          '80922395546375089598655709477693009806793075640399849243804470083584', // graph-node
        ],
        featuredProjectIds: [
          '80927338512810702724070905882237017022089417038277884279346528518144', // svelte
          '80924437970685862336445237697146051810361983738382071874368862945280', // libgit2
          '80926915932044874567662239576164593128211047641556385561345492254720', // rollup
          '80926893484859255783823398448697429050946431358357802763937929756672', // ratatui
          '80907185984472938178947231143934051564334108789056821384881454972928', // gitoxide
          '80914552162673449833728329632154702021826817315592132431697405804544', // tanstack-query
          '80928551845018914533911124940323675679718022636490642073491274203136', // vitest
          '80928956680761126169933069488824219882230509123653596947248123478016', // websockets
        ],
      }),
  },
  80002: { variant: 'default', loadFn: loadDefaultExplorePageData },
  11155420: { variant: 'default', loadFn: loadDefaultExplorePageData },
  11155111: { variant: 'default', loadFn: loadDefaultExplorePageData },
  31337: { variant: 'default', loadFn: loadDefaultExplorePageData },
  84532: { variant: 'default', loadFn: loadDefaultExplorePageData },
  314: {
    variant: 'distribution',
    loadFn: (f) =>
      loadDistributionExplorePageData(f, {
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
  },
  1088: {
    variant: 'distribution',
    loadFn: (f) =>
      loadDistributionExplorePageData(f, {
        featuredListId: null,
        welcomeCardConfig: {
          title: 'Welcome to Drips on Metis',
          description: "Drips on Metis is where rewards from Metis' RetroPGF will be distributed.",
        },
      }),
  },
  10: {
    variant: 'default',
    loadFn: loadDefaultExplorePageData,
  },
} as const;

export const load = async ({ fetch }) => {
  const explorePageConfig = EXPLORE_PAGE_CONFIG[network.chainId];

  return {
    variant: explorePageConfig.variant,
    data: await explorePageConfig.loadFn(fetch),
  };
};

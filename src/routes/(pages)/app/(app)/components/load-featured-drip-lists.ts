import type { SUPPORTED_CHAIN_IDS, ValueForEachSupportedChain } from '$lib/stores/wallet/network';
import { fetchList } from './load-drip-list';

type FeaturedDripListConfig = {
  featuredDripListIds: string[];
};

const FEATURED_DRIPS_LISTS: ValueForEachSupportedChain<FeaturedDripListConfig> = {
  1: {
    featuredDripListIds: [
      '31017209032870028068280040871339261037749177808773684797297972107972', // ENS Ecosystem Term 5 Grant
      '34625983682950977210847096367816372822461201185275535522726531049130', // Radicle Dependencies
      '30178668158349445547603108732480118476541651095408979232800331391215', // Octant Dependencies
      '36167722434539895740687283110259945938004377627588501179309095983174', // Funding the Commons Builder Basic Income
    ],
  },
  80002: { featuredDripListIds: [] },
  11155420: { featuredDripListIds: [] },
  11155111: { featuredDripListIds: [] },
  // TODO: remove
  31337: {
    featuredDripListIds: ['52616587671615462427509444020197501845441172922069741943754869418580'],
  },
  84532: { featuredDripListIds: [] },
  314: {
    featuredDripListIds: [
      '45193817480599985262554974973835763972521255481355516335980315118301', // 2nd RPGF-2 FIL distribution
      '45193817480599985262554974973835763972521255481357121508020698376704', // 1st RPGF-2 FIL distribution
    ],
  },
  1088: {
    featuredDripListIds: [
      '49912297604373019159051760081241164707594370315238407529962585664988', // 1st Metis RPGF distribution
    ],
  },
  10: {
    featuredDripListIds: [
      '46441013481627019632859175771245733399752255312769848791334977723541', // Web3PrivacyNow list
    ],
  },
} as const;

export default async function fetchFeaturedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
) {
  const targetLists = FEATURED_DRIPS_LISTS[chainId]?.featuredDripListIds ?? [];
  const results = await Promise.all(targetLists.map(async (id) => await fetchList(id, f)));
  return results.filter((v) => v !== null && v !== undefined);
}

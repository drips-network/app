import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import EXPLORE_PAGE_CONFIG from './explore-page-config';
import { fetchList } from './load-drip-list';

export default async function fetchFeaturedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
) {
  const targetLists = EXPLORE_PAGE_CONFIG[chainId]?.featuredDripListIds ?? [];
  const results = await Promise.all(targetLists.map(async (id) => await fetchList(id, f)));
  return results.filter((v) => v !== null && v !== undefined);
}

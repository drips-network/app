import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import type { AllDripListsQuery } from './__generated__/gql.generated';
import EXPLORE_PAGE_CONFIG from './explore-page-config';
import { fetchList } from './load-drip-list';
import type { fetchDripLists } from './load-drip-lists';

export function isFeaturedDripList(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  dripList: AllDripListsQuery['dripLists'][number],
) {
  const targetLists = EXPLORE_PAGE_CONFIG[chainId]?.featuredDripListIds ?? [];
  return targetLists.includes(dripList.account.accountId);
}

export default async function fetchFeaturedDripLists(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  library?: Awaited<ReturnType<typeof fetchDripLists>>,
) {
  const targetLists = EXPLORE_PAGE_CONFIG[chainId]?.featuredDripListIds ?? [];
  if (library) {
    return library.filter((dripList) => targetLists.includes(dripList.account.accountId));
  }

  const results = await Promise.all(targetLists.map(async (id) => await fetchList(id, f)));
  return results.filter((v) => v !== null && v !== undefined);
}

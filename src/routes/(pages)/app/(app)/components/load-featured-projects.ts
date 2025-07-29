import type { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import EXPLORE_PAGE_CONFIG from './explore-page-config';
import { fetchProjects } from './load-projects';

// TODO: or we memoize the fetch projects function so that it is cached like a good boy
export async function fetchFeaturedProjects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  // library: ReturnType<typeof fetchProjects>[]
) {
  const featuredProjectIds = EXPLORE_PAGE_CONFIG[chainId]?.featuredProjectIds;
  if (!featuredProjectIds?.length) {
    return [];
  }

  // const defaultParameters = createFetchProjectsParameters()
  // TODO: cache!
  const projects = await fetchProjects(f);
  return projects.filter((p) => featuredProjectIds.includes(p.account.accountId));
}

export async function fetchFeaturedWeb3Projects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  // library: ReturnType<typeof fetchProjects>[]
) {
  const featuredWeb3ProjectIds = EXPLORE_PAGE_CONFIG[chainId]?.featuredWeb3ProjectIds;
  if (!featuredWeb3ProjectIds?.length) {
    return [];
  }

  // const defaultParameters = createFetchProjectsParameters()
  // TODO: cache!
  const projects = await fetchProjects(f);
  return projects.filter((p) => featuredWeb3ProjectIds.includes(p.account.accountId));
}

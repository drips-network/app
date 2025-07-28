// import { gql } from 'graphql-request';
// import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
// import query from '$lib/graphql/dripsQL';
// import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
// import getConnectedAddress from '$lib/utils/get-connected-address';
// import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import network from '$lib/stores/wallet/network';
import { fetchProjects } from '../components/load-projects';
// import type { ExploreProjectsQuery } from '../components/__generated__/gql.generated';
import { FEATURED_PROJECTS } from '../components/load-featured-projects';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';

// const fetchedDataCache = makeFetchedDataCache<ExploreProjectsQuery>('dashboard:projects');

export const load = async ({ fetch }) => {
  // const connectedAddress = getConnectedAddress();
  const connectedAccountId = get(walletStore).dripsAccountId;

  // TODO: this needs to also have account info to be the same as the fetchProjects function.
  // and just like the explore page now though, we need to fetch all of these projects and
  // sort them around so that they are in the right buckets.

  // fetch this big ol thing and then run it through these functions like you already have the library
  // or try to cache the underlying function so that when you call it again, it just returns the cached data
  // and then you kinda have a thing that's more like making a query, which I like better, but
  // the problem is that I don't think I can cache the function in a way that works with the SSR
  // const projectsQuery = gql`
  //   ${PROJECTS_PAGE_PROJECT_FRAGMENT}
  //   query ProjectsPage($address: String, $chains: [SupportedChain!]) {
  //     projects(chains: $chains, where: { ownerAddress: $address }) {
  //       ...ProjectsPageProject
  //     }
  //   }
  // `;

  // const res =
  //   fetchedDataCache.read() ??
  //   (await query<ProjectsPageQuery, ProjectsPageQueryVariables>(
  //     projectsQuery,
  //     { address: null, chains: [network.gqlName] },
  //     fetch,
  //   ));

  const projects = await fetchProjects(fetch);

  // TODO: udpate cache write
  // fetchedDataCache.write(projects);

  const featuredProjects = [];
  const yourProjects = [];
  const restProjects = [];
  for (const project of projects) {
    // TODO: necessary? Don't we already query using the current chain?
    // const chainData = filterCurrentChainData(project.chainData)
    if (project.chainData.some((chainData) => chainData.owner?.accountId === connectedAccountId)) {
      yourProjects.push(project);
    }

    if (
      FEATURED_PROJECTS[network.chainId]?.featuredProjectIds.includes(project.account.accountId)
    ) {
      featuredProjects.push(project);
      continue;
    }

    restProjects.push(project);
  }

  return {
    projects,
    yourProjects,
    restProjects,
    featuredProjects,
    preservePathOnNetworkChange: true,
  };
};

export const ssr = false;

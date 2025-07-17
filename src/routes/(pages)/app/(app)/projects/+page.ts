import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import network from '$lib/stores/wallet/network';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  const projectsQuery = gql`
    ${PROJECTS_PAGE_PROJECT_FRAGMENT}
    query ProjectsPage($address: String, $chains: [SupportedChain!]) {
      projects(chains: $chains, where: { ownerAddress: $address }) {
        ...ProjectsPageProject
      }
    }
  `;

  const res =
    fetchedDataCache.read() ??
    (await query<ProjectsPageQuery, ProjectsPageQueryVariables>(
      projectsQuery,
      { address: null, chains: [network.gqlName] },
      fetch,
    ));

  // TODO: udpate cache write
  fetchedDataCache.write(res);

  const yourProjects = []
  const restProjects = []
  for(const project of res.projects) {
    if (project.chainData.some((chainData) => chainData.owner?.accountId === connectedAddress)) {
      yourProjects.push(project);
      continue
    }

    restProjects.push(project);
  }

  return {
    projects: res.projects,
    yourProjects,
    restProjects,
    featuredProjects: [],
    preservePathOnNetworkChange: true
  };
};

export const ssr = false;

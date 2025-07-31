// import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
  SupportedChain,
} from '$lib/graphql/__generated__/base-types';
import query from '$lib/graphql/dripsQL';
import network, { SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import { DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT } from '../../components/recently-claimed-projects.svelte';
import type {
  ExploreProjectsQuery,
  ExploreProjectsQueryVariables,
} from './__generated__/gql.generated';
import FEATURED_PROJECTS_CONFIG from './featured-projects-config';

export const fetchProjectsQuery = gql`
  ${DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT}
  query ExploreProjects(
    $where: ProjectWhereInput
    $sort: ProjectSortInput
    $chains: [SupportedChain!]!
  ) {
    projects(where: $where, sort: $sort, chains: $chains) {
      ...DefaultExplorePageFeaturedProject
    }
  }
`;

type ProjectsParameters = {
  where: {
    verificationStatus: ProjectVerificationStatus;
  };
  sort: {
    direction: SortDirection;
    field: ProjectSortField;
  };
  chains: SupportedChain[];
};

export function createFetchProjectsParameters(): ProjectsParameters {
  return {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
    chains: [network.gqlName],
  };
}

// const fetchedDataCache = makeFetchedDataCache<ExploreProjectsQuery>('explore:projects');

// export async function fetchAllProjects(f: typeof fetch) {
// 	const cached = fetchedDataCache.read();
// 	if (cached) {
// 		return cached.projects;
// 	}

//   const projectsParameters = createFetchProjectsParameters();

// 	const projectsRes = await query<ExploreProjectsQuery, ExploreProjectsQueryVariables>(
// 		fetchProjectsQuery,
// 		projectsParameters,
// 		f
// 	);

// 	fetchedDataCache.write(projectsRes);

// 	return projectsRes.projects;
// }

// TODO: oof what a duplication!
export async function fetchProjects(f: typeof fetch, projectsParameters?: ProjectsParameters) {
  if (!projectsParameters) {
    projectsParameters = createFetchProjectsParameters();
  }

  const projectsRes = await query<ExploreProjectsQuery, ExploreProjectsQueryVariables>(
    fetchProjectsQuery,
    projectsParameters,
    f,
  );

  return projectsRes.projects;
}

export async function fetchAndCategorizeProjects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  connectedAccountId?: string,
  projectsParameters?: ProjectsParameters,
) {
  const projects = await fetchProjects(f, projectsParameters);

  const featuredProjects = [];
  const featuredWeb3Projects = [];
  const yourProjects = [];
  const restProjects = [];
  for (const project of projects) {
    // TODO: necessary? Don't we already query using the current chain?
    // const chainData = filterCurrentChainData(project.chainData)
    if (project.chainData.some((chainData) => chainData.owner?.accountId === connectedAccountId)) {
      yourProjects.push(project);
    }

    if (
      FEATURED_PROJECTS_CONFIG[chainId]?.featuredWeb3ProjectIds?.includes(project.account.accountId)
    ) {
      featuredWeb3Projects.push(project);
      continue;
    }

    if (
      FEATURED_PROJECTS_CONFIG[chainId]?.featuredProjectIds?.includes(project.account.accountId)
    ) {
      featuredProjects.push(project);
      continue;
    }

    restProjects.push(project);
  }

  return {
    featuredProjects,
    featuredWeb3Projects,
    yourProjects,
    restProjects,
  };
}

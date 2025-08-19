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
  ProjectQuery,
  ProjectQueryVariables,
} from './__generated__/gql.generated';
import FEATURED_PROJECTS_CONFIG from './featured-projects-config';

export const fetchProjectQuery = gql`
  ${DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT}
  query Project($projectId: ID!, $chains: [SupportedChain!]) {
    projectById(id: $projectId, chains: $chains) {
      ...DefaultExplorePageFeaturedProject
    }
  }
`;

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

export function createDefaultFetchProjectsParameters(): ProjectsParameters {
  return {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
    chains: [network.gqlName],
  };
}

export async function fetchProject(projectId: string, f: typeof fetch) {
  const projectRes = await query<ProjectQuery, ProjectQueryVariables>(
    fetchProjectQuery,
    {
      projectId: projectId,
      chains: [network.gqlName],
    },
    f,
  );

  return projectRes.projectById;
}

export async function fetchProjects(f: typeof fetch, projectsParameters?: ProjectsParameters) {
  if (!projectsParameters) {
    projectsParameters = createDefaultFetchProjectsParameters();
  }

  const projectsRes = await query<ExploreProjectsQuery, ExploreProjectsQueryVariables>(
    fetchProjectsQuery,
    projectsParameters,
    f,
  );

  return projectsRes.projects;
}

export async function fetchOwnProjects(f: typeof fetch, connectedAddress?: string) {
  if (!connectedAddress) {
    return [];
  }

  const defaultParameters = createDefaultFetchProjectsParameters();
  const parameters = Object.assign({}, defaultParameters, {
    where: { ownerAddress: connectedAddress },
  });
  return fetchProjects(f, parameters);
}

export async function fetchFeaturedProjects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
) {
  const featuredProjectsIds = FEATURED_PROJECTS_CONFIG[chainId]?.featuredProjectIds ?? [];
  const featuredWeb3ProjectsIds = FEATURED_PROJECTS_CONFIG[chainId]?.featuredWeb3ProjectIds ?? [];
  return {
    featuredProjects: await Promise.all(featuredProjectsIds.map(async (id) => fetchProject(id, f))),
    featuredWeb3Projects: await Promise.all(
      featuredWeb3ProjectsIds.map(async (id) => fetchProject(id, f)),
    ),
  };
}

async function fetchRecentProjects(f: typeof fetch) {
  const defaultParameters = createDefaultFetchProjectsParameters();
  const parameters = Object.assign({}, defaultParameters, { limit: 8 });
  return fetchProjects(f, parameters);
}

export async function fetchAndCategorizeProjects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  f: typeof fetch,
  connectedAccountId?: string,
) {
  const [yourProjects, { featuredProjects, featuredWeb3Projects }, restProjects] =
    await Promise.all([
      fetchOwnProjects(f, connectedAccountId),
      fetchFeaturedProjects(chainId, f),
      fetchRecentProjects(f),
    ]);

  return {
    featuredProjects,
    featuredWeb3Projects,
    yourProjects,
    restProjects,
  };
}

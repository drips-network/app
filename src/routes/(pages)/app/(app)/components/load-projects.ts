import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
  SupportedChain,
} from '$lib/graphql/__generated__/base-types';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type {
  ExploreProjectsQuery,
  ExploreProjectsQueryVariables,
} from './__generated__/gql.generated';
import { DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT } from './recently-claimed-projects.svelte';
// import { DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT } from './default-explore-page.svelte';

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

export async function fetchProjects(f: typeof fetch, projectsParameters: ProjectsParameters) {
  const projectsRes = await query<ExploreProjectsQuery, ExploreProjectsQueryVariables>(
    fetchProjectsQuery,
    projectsParameters,
    f,
  );

  return projectsRes.projects;
}

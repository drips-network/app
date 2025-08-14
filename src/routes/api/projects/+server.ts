import network from '$lib/stores/wallet/network';
import { json } from '@sveltejs/kit';
import { redis } from '../redis';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
  SupportedChain,
} from '$lib/graphql/__generated__/base-types';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type {
  ExploreProjectsQuery,
  ExploreProjectsQueryVariables,
} from './__generated__/gql.generated';
import { DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT } from '../../(pages)/app/(app)/components/recently-claimed-projects.svelte';

const fetchProjectsQuery = gql`
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

function createDefaultFetchProjectsParameters(): ProjectsParameters {
  return {
    where: { verificationStatus: ProjectVerificationStatus.Claimed },
    sort: { direction: SortDirection.Asc, field: ProjectSortField.ClaimedAt },
    chains: [network.gqlName],
  };
}

async function fetchProjects(f: typeof fetch, projectsParameters?: ProjectsParameters) {
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

const CACHE_KEY = `${network.name}-projects`;

export const GET = async ({ fetch }) => {
  const cached = redis && (await redis.get(CACHE_KEY));

  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const projects = fetchProjects(fetch);

  await redis?.set(CACHE_KEY, JSON.stringify(projects), {
    EX: 60 * 60, // one hour
  });

  return json(projects);
};

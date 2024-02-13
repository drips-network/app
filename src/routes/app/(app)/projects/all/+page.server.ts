import type { PageServerLoad } from './$types';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { ProjectsQuery, ProjectsQueryVariables } from './__generated__/gql.generated';
import { PROJECTS_LISTINGS_ITEM_FRAGMENT } from './+page.svelte';
import {
  ProjectSortField,
  ProjectVerificationStatus,
  SortDirection,
} from '$lib/graphql/__generated__/base-types';

export const load = (async ({ fetch }) => {
  const projectsQuery = gql`
    ${PROJECTS_LISTINGS_ITEM_FRAGMENT}
    query Projects($where: ProjectWhereInput, $sort: ProjectSortInput) {
      projects(where: $where, sort: $sort) {
        ...ProjectsListingsItem
      }
    }
  `;

  const fetches = await Promise.all([
    query<ProjectsQuery, ProjectsQueryVariables>(
      projectsQuery,
      {
        where: {
          verificationStatus: ProjectVerificationStatus.Claimed,
        },
        sort: {
          direction: SortDirection.Desc,
          field: ProjectSortField.ClaimedAt,
        },
      },
      fetch,
    ),
  ] as const);

  return {
    projects: fetches[0].projects,
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

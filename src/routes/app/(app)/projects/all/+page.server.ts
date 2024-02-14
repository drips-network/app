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

  return {
    projects: await query<ProjectsQuery, ProjectsQueryVariables>(
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
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

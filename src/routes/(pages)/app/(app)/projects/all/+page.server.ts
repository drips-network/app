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
import network from '$lib/stores/wallet/network';

export const load = (async ({ fetch }) => {
  const projectsQuery = gql`
    ${PROJECTS_LISTINGS_ITEM_FRAGMENT}
    query Projects(
      $where: ProjectWhereInput
      $sort: ProjectSortInput
      $chains: [SupportedChain!]!
    ) {
      projects(chains: $chains, where: $where, sort: $sort) {
        ...ProjectsListingsItem
      }
    }
  `;

  return {
    content: await query<ProjectsQuery, ProjectsQueryVariables>(
      projectsQuery,
      {
        where: {
          verificationStatus: ProjectVerificationStatus.Claimed,
        },
        sort: {
          direction: SortDirection.Desc,
          field: ProjectSortField.ClaimedAt,
        },
        chains: [network.gqlName],
      },
      fetch,
    ),
    blockWhileInitializing: false,
    preservePathOnNetworkChange: true,
  };
}) satisfies PageServerLoad;

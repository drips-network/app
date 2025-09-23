import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type {
  ApplicationPageDripsProjectQuery,
  ApplicationPageDripsProjectQueryVariables,
} from './__generated__/gql.generated';

const dripsProjectQuery = gql`
  ${PROJECT_BADGE_FRAGMENT}
  query ApplicationPageDripsProject($id: ID!, $chains: [SupportedChain!]) {
    projectById(id: $id, chains: $chains) {
      ...ProjectBadge
    }
  }
`;

export const fetchProjectForApplication = async (
  fetch: typeof window.fetch,
  projectAccountId: string,
) =>
  (
    await query<ApplicationPageDripsProjectQuery, ApplicationPageDripsProjectQueryVariables>(
      dripsProjectQuery,
      { id: projectAccountId, chains: [network.gqlName] },
      fetch,
    )
  ).projectById;

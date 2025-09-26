import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import type {
  ApplicationPageDripsProjectQuery,
  ApplicationPageDripsProjectQueryVariables,
} from './__generated__/gql.generated';
import { RPGF_APPLICATION_SPLITS_CARD_PROJECT_FRAGMENT } from '$lib/components/rpgf-application-splits-card/rpgf-application-splits-card.svelte';

const dripsProjectQuery = gql`
  ${PROJECT_BADGE_FRAGMENT}
  ${RPGF_APPLICATION_SPLITS_CARD_PROJECT_FRAGMENT}
  query ApplicationPageDripsProject($id: ID!, $chains: [SupportedChain!]) {
    projectById(id: $id, chains: $chains) {
      ...ProjectBadge
      ...RpgfApplicationSplitsCardProject
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

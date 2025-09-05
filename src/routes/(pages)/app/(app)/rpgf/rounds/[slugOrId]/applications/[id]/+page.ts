import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network.js';
import { getApplication } from '$lib/utils/rpgf/rpgf.js';
import { gql } from 'graphql-request';
import type {
  ApplicationPageDripsProjectQuery,
  ApplicationPageDripsProjectQueryVariables,
} from './__generated__/gql.generated.js';
import { error } from '@sveltejs/kit';
import { getRepoMetrics } from '$lib/utils/rpgf/oso.js';

export const load = async ({ fetch, params, parent }) => {
  const { round } = await parent();

  const application = await getApplication(fetch, round.id, params.id);

  const dripsProjectQuery = gql`
    ${PROJECT_BADGE_FRAGMENT}
    query ApplicationPageDripsProject($id: ID!, $chains: [SupportedChain!]) {
      projectById(id: $id, chains: $chains) {
        ...ProjectBadge
      }
    }
  `;

  const dripsProject = (
    await query<ApplicationPageDripsProjectQuery, ApplicationPageDripsProjectQueryVariables>(
      dripsProjectQuery,
      { id: application.dripsAccountId, chains: [network.gqlName] },
      fetch,
    )
  ).projectById;

  if (!dripsProject) {
    throw error(404, 'Project not found');
  }

  // Not awaiting this so that it gets streamed to the client
  const osoCoreMetrics = getRepoMetrics(
    dripsProject.source.ownerName,
    dripsProject.source.repoName,
    fetch,
  );

  return {
    application,
    dripsProject,
    osoCoreMetrics,
  };
};

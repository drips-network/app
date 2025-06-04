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

export const load = async ({ fetch, params, parent }) => {
  const { wrappedRound } = await parent();

  const application = await getApplication(
    fetch,
    wrappedRound.round.urlSlug,
    wrappedRound.round.applicationFormat,
    params.id,
  );

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

  return {
    application,
    dripsProject,
  };
};

import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import network from '$lib/stores/wallet/network';
import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import type {
  NewRpgfApplicationPageProjectsQuery,
  NewRpgfApplicationPageProjectsQueryVariables,
} from './__generated__/gql.generated.js';

export const load = async ({ fetch, url }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: url.pathname }));
  }

  const projectsQuery = gql`
    ${PROJECT_BADGE_FRAGMENT}
    query NewRpgfApplicationPageProjects($address: String, $chains: [SupportedChain!]) {
      projects(chains: $chains, where: { ownerAddress: $address }) {
        ...ProjectBadge
        account {
          accountId
        }
      }
    }
  `;

  const res = await query<
    NewRpgfApplicationPageProjectsQuery,
    NewRpgfApplicationPageProjectsQueryVariables
  >(projectsQuery, { address: connectedAddress, chains: [network.gqlName] }, fetch);

  return { projects: res.projects };
};

export const ssr = false;

import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import network from '$lib/stores/wallet/network';
import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import type {
  NewRpgfApplicationPageProjectsQuery,
  NewRpgfApplicationPageProjectsQueryVariables,
} from './__generated__/gql.generated.js';
import { getAddress } from 'ethers';

export const load = async ({ fetch, url, parent }) => {
  const { rpgfUserData } = await parent();

  if (!rpgfUserData) {
    redirect(307, buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }));
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
  >(
    projectsQuery,
    { address: getAddress(rpgfUserData.walletAddress), chains: [network.gqlName] },
    fetch,
  );

  return { projects: res.projects };
};

export const ssr = false;

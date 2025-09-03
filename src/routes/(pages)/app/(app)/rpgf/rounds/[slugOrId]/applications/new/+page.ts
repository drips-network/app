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
import { getApplicationCategories, getApplicationForms } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ fetch, url, parent }) => {
  const { rpgfUserData, round } = await parent();

  if (!rpgfUserData) {
    redirect(307, buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }));
  }

  async function fetchProjects(
    rpgfUserData: { walletAddress: string },
  ) {
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

    return await query<
      NewRpgfApplicationPageProjectsQuery,
      NewRpgfApplicationPageProjectsQueryVariables
    >(
      projectsQuery,
      { address: getAddress(rpgfUserData.walletAddress), chains: [network.gqlName] },
      fetch,
    );
  }

  const [projectsRes, applicationForms, categories] = await Promise.all([
    fetchProjects(rpgfUserData),
    getApplicationForms(fetch, round.id),
    getApplicationCategories(fetch, round.id),
  ]);

  return { projects: projectsRes.projects, applicationForms, categories };
};

export const ssr = false;

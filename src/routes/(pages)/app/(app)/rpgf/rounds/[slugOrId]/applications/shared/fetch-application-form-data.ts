import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
import { gql } from 'graphql-request';
import type {
  NewRpgfApplicationPageProjectsQuery,
  NewRpgfApplicationPageProjectsQueryVariables,
} from './__generated__/gql.generated.js';
import { getAddress } from 'ethers';
import network from '$lib/stores/wallet/network.js';
import query from '$lib/graphql/dripsQL.js';
import { getApplicationCategories, getApplicationForms } from '$lib/utils/rpgf/rpgf.js';

export default async function fetchApplicationFormData(
  walletAddress: string,
  roundId: string,
  fetch: typeof globalThis.fetch,
) {
  async function fetchProjects(walletAddress: string) {
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
    >(projectsQuery, { address: getAddress(walletAddress), chains: [network.gqlName] }, fetch);
  }

  const [projectsRes, applicationForms, categories] = await Promise.all([
    fetchProjects(walletAddress),
    getApplicationForms(fetch, roundId),
    getApplicationCategories(fetch, roundId),
  ]);

  return { projects: projectsRes.projects, applicationForms, categories };
}

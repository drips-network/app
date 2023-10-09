import { Forge as ApiForge } from '$lib/graphql/generated/graphql';
import { Forge as ContractForge } from 'radicle-drips';
import type { Source } from '../metadata/types';
import type { GitHubSource, GitProject } from '$lib/utils/metadata/types';
import fetchRelevantTokens from '$lib/utils/drips/relevant-tokens';
import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';

export async function fetchUnclaimedFunds(projectAccountId: string) {
  const relevantTokens = await fetchRelevantTokens('splittable', projectAccountId);

  return (await fetchBalancesForTokens('splittable', relevantTokens, projectAccountId)).map(
    (a) => ({
      tokenAddress: a.tokenAddress,
      amount: a.splittableAmount,
    }),
  );
}

/**
 * Validate that a GitProject is from a specific forge.
 * @param forge The forge to validate for.
 * @param project The project the source of which should be validated.
 * @returns True if it's the expected source, false otherwise.
 */
export default function isForge<FT extends 'github'>(
  forge: FT,
  project: GitProject,
): project is GitProject<FT extends 'github' ? GitHubSource : never> {
  if (project.source.forge !== forge) return false;

  return true;
}

export function populateSource(forge: ContractForge, repoName: string, username: string): Source {
  let url: string;

  switch (forge) {
    case ContractForge.GitHub:
      url = `https://github.com/${username}/${repoName}`;
      break;
    default:
      throw new Error(`Unsupported forge: ${forge}`);
  }

  // TODO: support more forges.
  switch (forge) {
    case ContractForge.GitHub:
      return {
        url,
        repoName,
        forge: 'github',
        ownerName: username,
      };
    default:
      throw new Error(`Unsupported forge: ${forge}`);
  }
}

export function toContractForge(forge: ApiForge): ContractForge {
  switch (forge) {
    case ApiForge.GitHub:
      return ContractForge.GitHub;
    default:
      throw new Error(`Unknown forge: ${forge}`);
  }
}

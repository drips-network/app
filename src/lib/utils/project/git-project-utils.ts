import { Forge as ApiForge } from '$lib/graphql/generated/graphql';
import { Forge as ContractForge } from 'radicle-drips';
import type { Source } from '../metadata/types';
import fetchRelevantTokens from '$lib/utils/drips/relevant-tokens';
import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';

export function buildProjectUrl(forge: ApiForge, ownerName: string, repoName: string) {
  switch (forge) {
    case ApiForge.GitHub:
      return `/app/projects/github/${encodeURIComponent(ownerName)}/${encodeURIComponent(
        repoName,
      )}`;
  }
}

export async function fetchUnclaimedFunds(projectAccountId: string) {
  const relevantTokens = await fetchRelevantTokens('splittable', projectAccountId);

  return (await fetchBalancesForTokens('splittable', relevantTokens, projectAccountId)).map(
    (a) => ({
      tokenAddress: a.tokenAddress,
      amount: a.splittableAmount,
    }),
  );
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

export function forgeFromString(forgeStr: string): ApiForge {
  switch (forgeStr.toLowerCase()) {
    case 'github':
      return ApiForge.GitHub;
    default:
      throw new Error(`Unknown forge: ${forgeStr}`);
  }
}

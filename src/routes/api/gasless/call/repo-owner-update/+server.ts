import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  IsProjectUnclaimedQuery,
  IsProjectUnclaimedQueryVariables,
} from './__generated__/gql.generated';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import { Octokit } from '@octokit/rest';
import GitHub from '$lib/utils/github/GitHub';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { relayOwnerUpdateTx } from '../relay-owner-update';

const GITHUB_PERSONAL_ACCESS_TOKEN = getOptionalEnvVar(
  'GITHUB_PERSONAL_ACCESS_TOKEN',
  true,
  'Gasless repo-owner-update transactions may fail to plan due to severe GitHub API rate limits.',
);

const octokit = new Octokit({ auth: GITHUB_PERSONAL_ACCESS_TOKEN });
const github = new GitHub(octokit);

const payloadSchema = z.object({
  forge: z.number(),
  projectName: z.string(),
  chainId: z.number(),
});

const projectUnclaimedQuery = gql`
  query isProjectUnclaimed($projectUrl: String!, $chains: [SupportedChain!]!) {
    projectByUrl(url: $projectUrl, chains: $chains) {
      chainData {
        ... on UnClaimedProjectData {
          chain
          owner {
            address
          }
        }
        ... on ClaimedProjectData {
          chain
          owner {
            address
          }
        }
      }
    }
  }
`;

export const POST: RequestHandler = async ({ request, fetch }) => {
  if (!network.gaslessTransactions) {
    throw error(404, 'Gasless transactions are not enabled on this network');
  }

  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    error(400, 'Invalid payload');
  }

  const { forge, projectName, chainId } = payload;

  if (network.chainId !== chainId) {
    throw error(400, 'Unsupported chain id');
  }

  const isProjectUnclaimedQueryResponse = await query<
    IsProjectUnclaimedQuery,
    IsProjectUnclaimedQueryVariables
  >(
    projectUnclaimedQuery,
    {
      projectUrl: `https://github.com/${projectName}`,
      chains: [network.gqlName],
    },
    fetch,
  );

  if (!isProjectUnclaimedQueryResponse.projectByUrl) {
    return error(400, 'Project not found on GitHub');
  }

  const chainData = filterCurrentChainData(isProjectUnclaimedQueryResponse.projectByUrl.chainData);

  if (chainData.__typename === 'ClaimedProjectData') {
    return error(400, 'Project already claimed');
  }

  const [owner, repo] = projectName.split('/');
  const currentFundingJsonAddress = await github.getFundingJsonAddress(owner, repo);

  if (chainData.owner.address.toLowerCase() === currentFundingJsonAddress?.toLowerCase()) {
    return new Response('{ "taskId": null }');
  }

  const blockKey = `${network.name}-ownerUpdateRequest-${forge}-${projectName}`;
  return relayOwnerUpdateTx(blockKey, forge, projectName, chainId);
};

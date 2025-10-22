import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import unreachable from '$lib/utils/unreachable';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import assert from '$lib/utils/assert';
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
import { redis } from '../../../redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { buildRequestOwnerUpdateTx } from '../build-txs';

const GELATO_API_KEY = getOptionalEnvVar(
  'GELATO_API_KEY',
  true,
  "Gasless transactions won't work." +
    "This means that claiming a project won't and collecting funds (on networks supporting gasless TXs and with gasless TXs enabled in settings) won't work.",
);

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
  assert(
    GELATO_API_KEY,
    'GELATO_API_KEY is required. Gasless transactions will not work without it.',
  );

  assert(
    redis,
    'This endpoint requires a connected Redis instance. Ensure CACHE_REDIS_CONNECTION_STRING is set in env',
  );

  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    error(400, 'Invalid payload');
  }

  // eslint-disable-next-line no-console
  console.log('REPO_OWNER_UPDATE', payload);

  const { forge, projectName, chainId } = payload;

  assert(network.chainId === chainId, 'Unsupported chain id');

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
  const blockRecordTaskId = await redis.get(blockKey);

  if (blockRecordTaskId) {
    const taskStatusRes = await fetch(`/api/gasless/track/${blockRecordTaskId}`);
    if (!taskStatusRes.ok)
      throw new Error(`Failed to fetch task status: ${await taskStatusRes.text()}`);

    const { task } = await taskStatusRes.json();
    assert(typeof task === 'object', 'Invalid task');
    const { taskState } = task;
    assert(typeof taskState === 'string', 'Invalid task state');

    if (['CheckPending', 'ExecPending', 'WaitingForConfirmation'].includes(taskState)) {
      // A request is already in-flight
      return new Response(JSON.stringify({ taskId: blockRecordTaskId }));
    } else {
      await redis.del(blockKey);
    }
  }

  const tx = await buildRequestOwnerUpdateTx(forge, projectName);

  const relayRequest: SponsoredCallRequest = {
    chainId: BigInt(chainId),
    target: tx.to ?? unreachable(),
    data: tx.data ?? unreachable(),
  };

  const relay = new GelatoRelay();

  try {
    const relayResponse = await relay.sponsoredCall(relayRequest, GELATO_API_KEY);
    const { taskId } = relayResponse;

    // eslint-disable-next-line no-console
    console.log('RELAY_RESPONSE', payload, relayResponse);

    redis.set(blockKey, taskId, {
      // 4 hours
      EX: 4 * 60 * 60,
    });

    return new Response(JSON.stringify(relayResponse));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(500, e instanceof Error ? e : 'Unknown error');
  }
};

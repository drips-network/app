import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { ethers, toUtf8Bytes } from 'ethers';
import unreachable from '$lib/utils/unreachable';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import { GELATO_API_KEY } from '$env/static/private';
import assert from '$lib/utils/assert';
import network, { getNetwork } from '$lib/stores/wallet/network';
import FailoverJsonRpcProvider from '$lib/utils/FailoverProvider';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
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

const octokit = new Octokit();
const github = new GitHub(octokit);

const payloadSchema = z.object({
  forge: z.number(),
  projectName: z.string(),
  chainId: z.number(),
});

const REPO_DRIVER_ABI = `[
  {
    "inputs": [
      { "internalType": "enum Forge", "name": "forge", "type": "uint8" },
      { "internalType": "bytes", "name": "name", "type": "bytes" }
    ],
    "name": "requestUpdateOwner",
    "outputs": [{ "internalType": "uint256", "name": "accountId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;

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
    return new Response(JSON.stringify({ taskId: undefined }));
  }

  const blockKey = `${network.name}-ownerUpdateRequest-${forge}-${projectName}`;
  const blockRecordTaskId = await redis.get(blockKey);

  if (blockRecordTaskId) {
    const taskStatusRes = await fetch(`/api/gasless/track/${blockRecordTaskId}`);

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

  const { rpcUrl, fallbackRpcUrl } = getNetwork(chainId);
  const provider = new FailoverJsonRpcProvider(
    mapFilterUndefined([rpcUrl, fallbackRpcUrl], (url) => url),
  );
  const contract = new ethers.Contract(network.contracts.REPO_DRIVER, REPO_DRIVER_ABI, provider);

  const tx = await contract.requestUpdateOwner.populateTransaction(
    forge,
    ethers.hexlify(toUtf8Bytes(projectName)),
  );

  const relayRequest: SponsoredCallRequest = {
    chainId: BigInt(chainId),
    target: tx.to ?? unreachable(),
    data: tx.data ?? unreachable(),
  };

  const relay = new GelatoRelay();

  try {
    const relayResponse = await relay.sponsoredCall(relayRequest, GELATO_API_KEY);
    const { taskId } = relayResponse;

    redis.set(blockKey, taskId, {
      EX: 60 * 60 * 24, // 1 day
    });

    return new Response(JSON.stringify(relayResponse));
  } catch (e) {
    return error(500, e instanceof Error ? e : 'Unknown error');
  }
};

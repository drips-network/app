import network from '$lib/stores/wallet/network';
import { addressDriverAbi } from '$lib/utils/sdk/address-driver/address-driver-abi.js';
import { repoDriverAbi } from '$lib/utils/sdk/repo-driver/repo-driver-abi.js';
import { ethers, verifyTypedData } from 'ethers';
import { z } from 'zod';
import assert from '$lib/utils/assert';
import { Interface } from 'ethers';
import { callerAbi } from '$lib/utils/sdk/caller/caller-abi.js';
import { Signature } from 'ethers';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import FailoverJsonRpcProvider from '$lib/utils/FailoverProvider';
import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
import { GELATO_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { TransactionDescription } from 'ethers';
import { nativeTokenUnwrapperAbi } from '$lib/utils/sdk/native-token-unrapper/native-token-unwrapper-abi.js';
import { dripsAbi } from '$lib/utils/sdk/drips/drips-abi.js';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL.js';
import type {
  IsProjectUnclaimedQuery,
  IsProjectUnclaimedQueryVariables,
} from './__generated__/gql.generated.js';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data.js';

const { rpcUrl, fallbackRpcUrl } = network;
const provider = new FailoverJsonRpcProvider(
  mapFilterUndefined([rpcUrl, fallbackRpcUrl], (url) => url),
);
const caller = new ethers.Contract(network.contracts.CALLER, callerAbi, provider);

const relay = new GelatoRelay();

const requestSchema = z.object({
  targetContractAddress: z.string(),
  callData: z.string(),
  payload: z.object({
    sender: z.string(),
    target: z.string(),
    data: z.string(),
    value: z.number(),
    nonce: z.number(),
    deadline: z.number(),
  }),
  eip712Signature: z.string(),
});

enum SupportedGaslessAction {
  CLAIM_PROJECT = 'CLAIM_PROJECT',
  COLLECT_EARNINGS = 'COLLECT_EARNINGS',
}

const SUPPORTED_CONTRACT_ABIS = {
  CALLER: callerAbi,
};

const projectUnclaimedQuery = gql`
  query isProjectUnclaimed($projectId: ID!, $chains: [SupportedChain!]!) {
    projectById(id: $projectId, chains: $chains) {
      chainData {
        ... on UnClaimedProjectData {
          chain
        }
        ... on ClaimedProjectData {
          chain
        }
      }
    }
  }
`;

function verifySupportedContract(targetContractAddress: string): string | null {
  const supportedContractNames = Object.keys(SUPPORTED_CONTRACT_ABIS);
  const supportedContracts = Object.entries(network.contracts).filter(
    ([contractName, address]) => supportedContractNames.includes(contractName) && address,
  );

  return (
    supportedContracts.find(
      (v) => v[1]?.toLowerCase() === targetContractAddress.toLowerCase(),
    )?.[0] ?? null
  );
}

/** Verify that the signature is calling Caller's `callSigned` fn. This is the only function we want to support gasless calls for. */
function verifySignature(
  sig: string,
  payload: z.infer<typeof requestSchema>['payload'],
  expectedTarget: string,
) {
  const domain = {
    name: 'Caller',
    version: '1',
    chainId: network.chainId,
    verifyingContract: network.contracts.CALLER,
  };

  const types = {
    CallSigned: [
      {
        name: 'sender',
        type: 'address',
      },
      {
        name: 'target',
        type: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'deadline',
        type: 'uint256',
      },
    ],
  };

  return (
    verifyTypedData(domain, types, payload, sig).toLowerCase() === payload.sender.toLowerCase() &&
    payload.target.toLowerCase() === expectedTarget.toLowerCase()
  );
}

function parseCallBatchedArgs(txDescription: TransactionDescription) {
  return z.array(z.tuple([z.string(), z.string(), z.bigint()])).safeParse(txDescription.args.calls);
}

async function validateClaimProjectTx(txDescription: TransactionDescription): Promise<boolean> {
  if (txDescription.name !== 'callBatched') return false;

  const parseCallsResult = parseCallBatchedArgs(txDescription);
  if (!parseCallsResult.success) return false;

  const parsedCalls = parseCallsResult.data;

  let projectAccountId: string | undefined = undefined;

  // Check whether the batch includes the expected:
  // 1. Set splits
  // 2. Emit account metadata
  // 3 [...] x : Any number of split calls
  // x [...] y : Any number of collect calls
  for (const [index, [target, calldata]] of parsedCalls.entries()) {
    // Ensure the call is to RepoDriver
    if (target.toLowerCase() !== network.contracts.REPO_DRIVER.toLowerCase()) {
      return false;
    }

    // Parse the calldata
    const repoDriverIface = new Interface(repoDriverAbi);
    const dripsIface = new Interface(dripsAbi);

    const repoDriverParseRes = repoDriverIface.parseTransaction({ data: calldata });
    const dripsParseRes = dripsIface.parseTransaction({ data: calldata });
    if (!(repoDriverParseRes || dripsParseRes)) return false;

    switch (index) {
      case 0: {
        if (repoDriverParseRes?.name !== 'setSplits') return false;

        projectAccountId = repoDriverParseRes.args[0].toString();

        break;
      }
      case 1: {
        if (repoDriverParseRes?.name !== 'emitAccountMetadata') return false;
        if (repoDriverParseRes.args[0].toString() !== projectAccountId) return false;

        break;
      }
    }
  }

  // Validate that the project in question is currently unclaimed

  if (!projectAccountId) return false;
  const isProjectUnclaimedQueryResponse = await query<
    IsProjectUnclaimedQuery,
    IsProjectUnclaimedQueryVariables
  >(
    projectUnclaimedQuery,
    {
      projectId: projectAccountId,
      chains: [network.gqlName],
    },
    fetch,
  );

  if (!isProjectUnclaimedQueryResponse.projectById)
    return error(400, '{ "error": "Project not found" }');
  const chainData = filterCurrentChainData(isProjectUnclaimedQueryResponse.projectById.chainData);
  if (chainData.__typename === 'ClaimedProjectData')
    return error(400, '{ "error": "Project already claimed" }');

  return true;
}

function validateCollectEarningsTx(txDescription: TransactionDescription): boolean {
  if (txDescription.name !== 'callBatched') return false;

  const parseCallsResult = parseCallBatchedArgs(txDescription);
  if (!parseCallsResult.success) return false;

  const parsedCalls = parseCallsResult.data;

  // Ensure all calls are either
  // 1. Collect on drips,
  // 2. ReceiveStreams on address driver,
  // 3. SqueezeStreams on address driver,
  // 4. Split on address driver, or
  // 4. Unwrap on native token unwrapper

  for (const [target, calldata] of parsedCalls) {
    const targetIsDrips = target.toLowerCase() === network.contracts.DRIPS.toLowerCase();
    const targetIsNativeTokenUnwrapper =
      target.toLowerCase() === network.contracts.NATIVE_TOKEN_UNWRAPPER?.toLowerCase();
    const targetIsAddressDriver =
      target.toLowerCase() === network.contracts.ADDRESS_DRIVER.toLowerCase();

    if (targetIsDrips) {
      const dripsIface = new Interface(dripsAbi);
      const dripsParseRes = dripsIface.parseTransaction({ data: calldata });

      if (!dripsParseRes) return false;

      if (
        dripsParseRes.name !== 'receiveStreams' &&
        dripsParseRes.name !== 'squeezeStreams' &&
        dripsParseRes.name !== 'split'
      ) {
        return false;
      }
    } else if (targetIsAddressDriver) {
      const addressDriverIface = new Interface(addressDriverAbi);
      const addressDriverParseRes = addressDriverIface.parseTransaction({ data: calldata });

      if (!addressDriverParseRes) return false;

      if (addressDriverParseRes.name !== 'collect') return false;
    } else if (targetIsNativeTokenUnwrapper) {
      const iface = new Interface(nativeTokenUnwrapperAbi);
      const parseRes = iface.parseTransaction({ data: calldata });

      if (!parseRes) return false;

      if (parseRes.name !== 'unwrap') return false;
    } else {
      return false;
    }
  }

  return true;
}

/** Verify that the calldata corresponds to a supported gasless action. */
async function inferActionType(
  calldata: string,
  contractName: string,
): Promise<SupportedGaslessAction | null> {
  const contractAbi = Object.entries(SUPPORTED_CONTRACT_ABIS).find(
    ([name]) => name === contractName,
  )?.[1];
  assert(contractAbi, 'Invalid contract name');

  const iface = new Interface(contractAbi);

  const parseRes = iface.parseTransaction({ data: calldata });
  assert(parseRes, 'Invalid calldata');

  switch (contractName) {
    case 'CALLER': {
      if (validateCollectEarningsTx(parseRes)) return SupportedGaslessAction.COLLECT_EARNINGS;
      if (await validateClaimProjectTx(parseRes)) return SupportedGaslessAction.CLAIM_PROJECT;
      break;
    }
  }

  return null;
}

export const POST = async ({ request }) => {
  if (!network.gaslessClaimAndCollect)
    return error(400, '{ "error": "Gasless actions are not supported on this network" }');

  const body = await request.json();

  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return error(400, JSON.stringify(parsedBody.error));
  }

  const { targetContractAddress, payload, eip712Signature } = parsedBody.data;

  const contractName = verifySupportedContract(targetContractAddress);

  if (!contractName) {
    return error(400, '{ "error": "Invalid contract address" }');
  }

  if (!verifySignature(eip712Signature, payload, targetContractAddress)) {
    return error(400, '{ "error": "Invalid signature" }');
  }

  const { data } = payload;
  const actionType = await inferActionType(data, contractName);

  if (!actionType) {
    return error(400, '{ "error": "Unsupported gasless action" }');
  }

  const signature = Signature.from(eip712Signature);
  const r = signature.r;
  const vs = signature.yParityAndS;

  const tx = await caller.callSigned.populateTransaction(
    payload.sender,
    payload.target,
    payload.data,
    payload.deadline,
    r,
    vs,
  );

  const relayRequest: SponsoredCallRequest = {
    chainId: BigInt(network.chainId),
    target: tx.to,
    data: tx.data,
  };

  try {
    const relayResponse = await relay.sponsoredCall(relayRequest, GELATO_API_KEY);

    // eslint-disable-next-line no-console
    console.log('GASLESS_ACTION_RELAY_RESPONSE', payload, relayResponse);

    return new Response(JSON.stringify(relayResponse));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(
      500,
      e instanceof Error ? JSON.stringify({ error: e.message }) : `{ "error": "Unknown error" }`,
    );
  }
};

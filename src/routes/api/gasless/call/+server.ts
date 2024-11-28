import network, { getNetwork, NETWORK_CONFIG } from '$lib/stores/wallet/network';
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

const { rpcUrl, fallbackRpcUrl } = getNetwork(network.chainId);
const provider = new FailoverJsonRpcProvider(
  mapFilterUndefined([rpcUrl, fallbackRpcUrl], (url) => url),
);
const caller = new ethers.Contract(
  NETWORK_CONFIG[network.chainId].contracts.CALLER,
  callerAbi,
  provider,
);

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
  // TODO: remove
  ADD_FUNDS = 'ADD_FUNDS',
}

const SUPPORTED_CONTRACT_ABIS = {
  REPO_DRIVER: repoDriverAbi,
  ADDRESS_DRIVER: addressDriverAbi,
  CALLER: callerAbi,
};

function verifySupportedContract(targetContractAddress: string): string | null {
  const supportedContractNames = Object.keys(SUPPORTED_CONTRACT_ABIS);
  const supportedContracts = Object.entries(NETWORK_CONFIG[network.chainId].contracts).filter(
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
    verifyingContract: NETWORK_CONFIG[network.chainId].contracts.CALLER,
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

/** Verify that the calldata corresponds to a supported gasless action. */
function inferActionType(calldata: string, contractName: string): SupportedGaslessAction | null {
  const contractAbi = Object.entries(SUPPORTED_CONTRACT_ABIS).find(
    ([name]) => name === contractName,
  )?.[1];
  assert(contractAbi, 'Invalid contract name');

  const iface = new Interface(contractAbi);

  const parseRes = iface.parseTransaction({ data: calldata });
  assert(parseRes, 'Invalid calldata');

  switch (contractName) {
    case 'ADDRESS_DRIVER': {
      if (parseRes.name === 'setStreams') {
        return SupportedGaslessAction.ADD_FUNDS;
      }
      break;
    }
    case 'CALLER': {
      break;
    }
    default:
      throw new Error('Unsupported contract name');
  }

  return null;
}

export const POST = async ({ request }) => {
  const body = await request.json();

  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return new Response(JSON.stringify(parsedBody.error), { status: 400 });
  }

  const { targetContractAddress, payload, eip712Signature } = parsedBody.data;

  const contractName = verifySupportedContract(targetContractAddress);

  if (!contractName) {
    return new Response('Invalid contract address', { status: 400 });
  }

  if (!verifySignature(eip712Signature, payload, targetContractAddress)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const { data } = payload;
  const actionType = inferActionType(data, contractName);

  if (!actionType) {
    return new Response('Unsupported gasless action', { status: 400 });
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
    console.log('RELAY_RESPONSE', payload, relayResponse);

    return new Response(JSON.stringify(relayResponse));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(500, e instanceof Error ? e : 'Unknown error');
  }
};

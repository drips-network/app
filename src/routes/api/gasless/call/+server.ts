import network from '$lib/stores/wallet/network';
import { ethers, verifyTypedData } from 'ethers';
import { z } from 'zod';
import { callerAbi } from '$lib/utils/sdk/caller/caller-abi.js';
import { Signature } from 'ethers';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import FailoverJsonRpcProvider from '$lib/utils/FailoverJsonRpcProvider';
import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
import { error } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const GELATO_API_KEY = getOptionalEnvVar(
  'GELATO_API_KEY',
  true,
  "Gasless transactions won't work." +
    "This means that claiming a project won't and collecting funds (on networks supporting gasless TXs and with gasless TXs enabled in settings) won't work.",
);

const { rpcUrl, fallbackRpcUrl } = network;
const provider = new FailoverJsonRpcProvider(
  mapFilterUndefined([rpcUrl, fallbackRpcUrl], (url) => url),
  undefined,
  undefined,
  {
    logger: console,
  },
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

const SUPPORTED_CONTRACT_ABIS = {
  CALLER: callerAbi,
};

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

export const POST = async ({ request }) => {
  if (!GELATO_API_KEY)
    return error(500, '{ "error": "GELATO_API_KEY is required for gasless transactions" }');
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

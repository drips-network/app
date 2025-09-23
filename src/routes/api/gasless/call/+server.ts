import network from '$lib/stores/wallet/network';
import { ethers, verifyTypedData, type ContractTransaction } from 'ethers';
import { z } from 'zod';
import { callerAbi } from '$lib/utils/sdk/caller/caller-abi.js';
import { Signature } from 'ethers';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import { error } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { JsonRpcProvider } from 'ethers';
import easAbi from '$lib/utils/rpgf/eas-abi.js';
import assert from '$lib/utils/assert';

const GELATO_API_KEY = getOptionalEnvVar(
  'GELATO_API_KEY',
  true,
  "Gasless transactions won't work." +
    "This means that claiming a project won't and collecting funds (on networks supporting gasless TXs and with gasless TXs enabled in settings) won't work.",
);

const provider = new JsonRpcProvider(network.rpcUrl);
const caller = new ethers.Contract(network.contracts.CALLER, callerAbi, provider);
const eas =
  network.retroFunding.enabled && network.retroFunding.attestationConfig.enabled
    ? new ethers.Contract(network.retroFunding.attestationConfig.easAddress, easAbi, provider)
    : null;

const relay = new GelatoRelay();

const callerPayloadSchema = z.object({
  sender: z.string(),
  target: z.string(),
  data: z.string(),
  value: z.string(),
  nonce: z.number(),
  deadline: z.number(),
});

const easDelegatedAttestPayloadSchema = z.object({
  attester: z.string(),
  schema: z.string(),
  recipient: z.string(),
  expirationTime: z.number(),
  revocable: z.boolean(),
  refUID: z.string(),
  data: z.string(),
  value: z.string(),
  nonce: z.number(),
  deadline: z.number(),
});

const requestSchema = z.object({
  targetContractAddress: z.string(),
  callData: z.string(),
  payload: z.union([callerPayloadSchema, easDelegatedAttestPayloadSchema]),
  eip712Signature: z.string(),
});

const SUPPORTED_CONTRACT_ABIS = {
  CALLER: callerAbi,
  EAS: easAbi,
};

function verifySupportedContract(targetContractAddress: string): string | null {
  const supportedContractNames = Object.keys(SUPPORTED_CONTRACT_ABIS);
  const supportedContracts = [
    ...Object.entries(network.contracts).filter(
      ([contractName, address]) => supportedContractNames.includes(contractName) && address,
    ),
    network.retroFunding?.enabled && network.retroFunding?.attestationConfig?.enabled
      ? ['EAS', network.retroFunding.attestationConfig.easAddress]
      : [],
  ];

  return (
    supportedContracts.find(
      (v) => v[1]?.toLowerCase() === targetContractAddress.toLowerCase(),
    )?.[0] ?? null
  );
}

/** Verify that the signature is calling Caller's `callSigned` fn. This is the only function we want to support gasless calls for. */
function verifyCallerSignature(
  sig: string,
  payload: z.infer<typeof callerPayloadSchema>,
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
  if (!GELATO_API_KEY) {
    return error(500, '{ "error": "GELATO_API_KEY is required for gasless transactions" }');
  }
  if (!network.gaslessTransactions) {
    return error(400, '{ "error": "Gasless actions are not supported on this network" }');
  }

  const body = await request.json();

  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return error(400, JSON.stringify(parsedBody.error));
  }

  const { targetContractAddress, payload, eip712Signature } = parsedBody.data;

  const contractName = verifySupportedContract(targetContractAddress);
  if (contractName === 'EAS' && !eas) {
    return error(400, '{ "error": "EAS is not enabled on this network" }');
  }

  if (!contractName) {
    return error(400, '{ "error": "Invalid contract address" }');
  }

  if (
    contractName === 'CALLER' &&
    !verifyCallerSignature(
      eip712Signature,
      payload as z.infer<typeof callerPayloadSchema>,
      targetContractAddress,
    )
  ) {
    return error(400, '{ "error": "Invalid signature" }');
  }

  const signature = Signature.from(eip712Signature);
  const r = signature.r;
  const vs = signature.yParityAndS;

  let tx: ContractTransaction;

  switch (contractName) {
    case 'CALLER': {
      const callerPayload = payload as z.infer<typeof callerPayloadSchema>;

      tx = await caller.callSigned.populateTransaction(
        callerPayload.sender,
        callerPayload.target,
        callerPayload.data,
        callerPayload.deadline,
        r,
        vs,
      );
      break;
    }
    case 'EAS': {
      assert(eas);

      const easPayload = payload as z.infer<typeof easDelegatedAttestPayloadSchema>;

      tx = await eas.attestByDelegation.populateTransaction({
        schema: easPayload.schema,
        data: {
          recipient: easPayload.recipient,
          expirationTime: 0n,
          revocable: false,
          refUID: easPayload.refUID,
          data: easPayload.data,
          value: 0n,
        },
        signature: {
          v: signature.v,
          r: signature.r,
          s: signature.s,
        },
        attester: easPayload.attester,
        deadline: easPayload.deadline,
      });

      break;
    }
    default:
      return error(400, `{ "error": "Unsupported contract: ${contractName}" }`);
  }

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

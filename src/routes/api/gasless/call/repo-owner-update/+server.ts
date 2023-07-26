import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { ethers, utils } from 'ethers';
import { getNetworkConfig } from '$lib/utils/get-drips-clients';
import unreachable from '$lib/utils/unreachable';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import { GELATO_API_KEY } from '$env/static/private';
import assert from '$lib/utils/assert';

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

export const POST: RequestHandler = async ({ request }) => {
  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    throw error(400, 'Invalid payload');
  }

  const { forge, projectName, chainId } = payload;

  assert([5, 1].includes(chainId), 'Only Goerli and Sepolia are supported for now');

  const repoDriverAddress = getNetworkConfig(chainId)?.REPO_DRIVER ?? unreachable();

  const provider = new ethers.providers.InfuraProvider(
    {
      chainId,
      name:
        {
          5: 'goerli',
          1: 'homestead',
        }[chainId] ?? unreachable(),
    },
    'f88a1229d473471bbf94d168401b9c93',
  );

  const contract = new ethers.Contract(repoDriverAddress, REPO_DRIVER_ABI, provider);

  const tx = await contract.populateTransaction.requestUpdateOwner(
    forge,
    ethers.utils.hexlify(utils.toUtf8Bytes(projectName)),
  );

  const relayRequest: SponsoredCallRequest = {
    chainId: chainId,
    target: tx.to ?? unreachable(),
    data: tx.data ?? unreachable(),
  };

  const relay = new GelatoRelay();

  const relayResponse = await relay.sponsoredCall(relayRequest, GELATO_API_KEY);

  return new Response(JSON.stringify(relayResponse));
};

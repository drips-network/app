/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestHandler } from './$types';
import { ALCHEMY_KEY, INFURA_KEY, FILECOIN_KEY } from '$env/static/private';
import assert from '$lib/utils/assert';

const providers = ['infura', 'alchemy', 'glif'] as const;
const networkNames = [
  'mainnet',
  'sepolia',
  'polygon-amoy',
  'optimism-sepolia',
  'base-sepolia',
  'filecoin-mainnet',
] as const;

const alchemyNetworkMap: Record<
  Exclude<(typeof networkNames)[number], 'filecoin-mainnet'>,
  string
> = {
  mainnet: 'eth-mainnet',
  sepolia: 'eth-sepolia',
  'polygon-amoy': 'polygon-amoy',
  'optimism-sepolia': 'opt-sepolia',
  'base-sepolia': 'base-sepolia',
};

const isValidProvider = (provider: any): provider is (typeof providers)[number] =>
  providers.includes(provider);
const isValidNetwork = (network: any): network is (typeof networkNames)[number] =>
  networkNames.includes(network);

/** Proxies all requests to the RPC provider and injects API access token */
export const fallback: RequestHandler = async ({ request, params, fetch }) => {
  const body = await request.text();

  const { provider, network } = params;
  assert(isValidProvider(provider), 'Invalid provider name');
  assert(isValidNetwork(network), 'Invalid network name');

  let rpcUrl: string;
  const headers = new Headers();

  switch (provider) {
    case 'infura':
      rpcUrl = `https://${network}.infura.io/v3/${INFURA_KEY}`;
      break;
    case 'alchemy':
      rpcUrl = `https://${alchemyNetworkMap[network as keyof typeof alchemyNetworkMap]}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      headers.set('accept-encoding', 'identity');
      break;
    case 'glif':
      rpcUrl = 'https://node.glif.io/fvm-archive/lotus/rpc/v1/';
      headers.set('Authorization', `Bearer ${FILECOIN_KEY}`);
      headers.set('Content-Type', 'application/json');
      break;
    default:
      throw new Error(`Unsupported network for provider: ${provider}`);
  }

  try {
    const response = await fetch(rpcUrl, {
      method: request.method,
      body: body || undefined,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from provider ${provider} on network ${network}`);
    }

    const resBody = await response.text();

    return new Response(resBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};

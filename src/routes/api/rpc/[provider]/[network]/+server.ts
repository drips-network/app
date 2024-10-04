/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestHandler } from './$types';
import { ALCHEMY_KEY, INFURA_KEY } from '$env/static/private';
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

type Params = {
  provider: (typeof providers)[number];
  network: (typeof networkNames)[number];
};

const isValidProvider = (provider: any): provider is Params['provider'] =>
  providers.includes(provider);
const isValidNetwork = (network: any): network is Params['network'] =>
  networkNames.includes(network);

/** Proxies all requests to the RPC provider and injects api access token */
export const fallback: RequestHandler = async ({ request, params, fetch }) => {
  const body = await request.text();

  const { provider, network } = params as Params;
  assert(isValidProvider(provider), 'Invalid provider name');
  assert(isValidNetwork(network), 'Invalid network name');

  const rpcUrl =
    provider === 'infura'
      ? `https://${network}.infura.io/v3/${INFURA_KEY}`
      : provider === 'alchemy'
        ? `https://${alchemyNetworkMap[network]}.g.alchemy.com/v2/${ALCHEMY_KEY}`
        : provider === 'glif'
          ? 'https://api.node.glif.io/'
          : null;

  if (!rpcUrl) {
    throw new Error(`Unsupported network for provider: ${provider}`);
  }

  try {
    const response = await fetch(rpcUrl, {
      method: request.method,
      body: body || undefined,
      headers:
        provider === 'alchemy'
          ? {
              'accept-encoding': 'identity',
            }
          : { ...request.headers },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from provider ${provider} on network ${network}`);
    }

    return response;
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};

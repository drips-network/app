/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

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
const isAlchemyNetwork = (network: string): network is keyof typeof alchemyNetworkMap => {
  return network in alchemyNetworkMap;
};

/** Proxies all requests to the RPC provider and injects API access token */
export const fallback: RequestHandler = async ({ request, params, fetch }) => {
  const body = await request.text();

  const { provider, network } = params;
  assert(isValidProvider(provider), 'Invalid provider name');
  assert(isValidNetwork(network), 'Invalid network name');

  let rpcUrl: string;
  const headers = new Headers();

  if (provider === 'infura') {
    const infuraKey = getOptionalEnvVar('INFURA_KEY');
    assert(infuraKey, 'INFURA_KEY is required');
    rpcUrl = `https://${network}.infura.io/v3/${infuraKey}`;
  } else if (provider === 'alchemy') {
    const alchemyKey = getOptionalEnvVar('ALCHEMY_KEY');
    assert(alchemyKey, 'ALCHEMY_KEY is required');
    assert(isAlchemyNetwork(network), `Invalid network for Alchemy provider: ${network}`);
    rpcUrl = `https://${alchemyNetworkMap[network]}.g.alchemy.com/v2/${alchemyKey}`;
    headers.set('accept-encoding', 'identity');
  } else if (provider === 'glif') {
    const filecoinKey = getOptionalEnvVar('FILECOIN_KEY');
    assert(filecoinKey, 'FILECOIN_KEY is required');
    rpcUrl = 'https://node.glif.io/fvm-archive/lotus/rpc/v1';
    headers.set('Authorization', `Bearer ${filecoinKey}`);
    headers.set('Content-Type', 'application/json');
  } else {
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

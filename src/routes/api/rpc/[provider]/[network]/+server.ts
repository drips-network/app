/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const providers = ['infura', 'alchemy', 'glif', 'anvil'] as const;
const networkNames = [
  'mainnet',
  'sepolia',
  'polygon-amoy',
  'optimism-sepolia',
  'base-sepolia',
  'filecoin-mainnet',
  'localtestnet',
] as const;

const alchemyNetworkMap: Record<
  Exclude<(typeof networkNames)[number], 'filecoin-mainnet' | 'localtestnet'>,
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

  switch (provider) {
    case 'infura': {
      const infuraKey = getOptionalEnvVar(
        'INFURA_KEY',
        true,
        "App won't be able to use Infura RPC, but it might work with another fallback RPC.",
      );
      assert(infuraKey, 'INFURA_KEY is required');
      rpcUrl = `https://${network}.infura.io/v3/${infuraKey}`;
      break;
    }

    case 'alchemy': {
      const alchemyKey = getOptionalEnvVar(
        'ALCHEMY_KEY',
        true,
        "App won't be able to use Alchemy RPC, but it might work with another fallback RPC.",
      );
      assert(alchemyKey, 'ALCHEMY_KEY is required');
      assert(isAlchemyNetwork(network), `Invalid network for Alchemy provider: ${network}`);
      rpcUrl = `https://${alchemyNetworkMap[network]}.g.alchemy.com/v2/${alchemyKey}`;
      headers.set('accept-encoding', 'identity');
      break;
    }

    case 'glif': {
      const filecoinKey = getOptionalEnvVar(
        'FILECOIN_KEY',
        true,
        "App won't be able to connect to Filecoin.",
      );
      assert(filecoinKey, 'FILECOIN_KEY is required');
      rpcUrl = 'https://node.glif.io/fvm-archive/lotus/rpc/v1';
      headers.set('Authorization', `Bearer ${filecoinKey}`);
      headers.set('Content-Type', 'application/json');
      break;
    }

    case 'anvil': {
      rpcUrl = getOptionalEnvVar('LOCAL_TESTNET_RPC_URL', false, null) ?? 'http://testnet:8545';
      headers.set('Content-Type', 'application/json');
      break;
    }

    default: {
      throw new Error(`Unsupported network for provider: ${provider}`);
    }
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

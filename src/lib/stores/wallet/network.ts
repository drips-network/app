import { PUBLIC_NETWORK } from '$env/static/public';
import assert from '$lib/utils/assert';
import { BASE_URL } from '$lib/utils/base-url';

const SUPPORTED_CHAIN_IDS = [1, 80002, 11155420, 11155111] as const;
export type ChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export type Network = {
  chainId: ChainId;
  name: string;
  label: string;
  token: string;
  id: string;
  rpcUrl: string;
};

export type ValueForEachSupportedChain<T> = Record<(typeof SUPPORTED_CHAIN_IDS)[number], T>;

const NETWORK_NAMES: ValueForEachSupportedChain<string> = {
  [1]: 'homestead',
  [80002]: 'amoy',
  [11155420]: 'optimism-sepolia',
  [11155111]: 'sepolia',
};

const NETWORK_LABELS: ValueForEachSupportedChain<string> = {
  [1]: 'Ethereum Mainnet',
  [80002]: 'Polygon Amoy',
  [11155420]: 'OP Sepolia',
  [11155111]: 'Sepolia',
};

const NETWORK_TOKENS: ValueForEachSupportedChain<string> = {
  [1]: 'ETH',
  [80002]: 'MATIC',
  [11155420]: 'ETH',
  [11155111]: 'ETH',
};

const NETWORK_ID: ValueForEachSupportedChain<string> = {
  [1]: '0x1',
  [80002]: '0x13882',
  [11155420]: '0xaa37dc',
  [11155111]: '0xaa36a7',
};

const RPC_URLS: ValueForEachSupportedChain<string> = {
  [1]: `${BASE_URL}/api/infura/mainnet`,
  [80002]: `${BASE_URL}/api/infura/polygon-amoy`,
  [11155420]: `${BASE_URL}/api/infura/optimism-sepolia`,
  [11155111]: `${BASE_URL}/api/infura/sepolia`,
} as const;

export function isSupportedChainId(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as ChainId);
}

const configuredChainId = Number(PUBLIC_NETWORK);
assert(
  isSupportedChainId(configuredChainId),
  'Missing or invalid PUBLIC_NETWORK env variable. See DEVELOPMENT.md for more information.',
);

export function isConfiguredChainId(chainId: number): boolean {
  return chainId === configuredChainId;
}

export function getNetwork(chainId: number): Network {
  assert(isSupportedChainId(chainId), 'Unsupported chain id');

  return {
    chainId,
    name: NETWORK_NAMES[chainId],
    label: NETWORK_LABELS[chainId],
    token: NETWORK_TOKENS[chainId],
    id: NETWORK_ID[chainId],
    rpcUrl: RPC_URLS[chainId],
  };
}

export default getNetwork(configuredChainId);

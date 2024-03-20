import { PUBLIC_NETWORK } from '$env/static/public';
import assert from '$lib/utils/assert';
import { BASE_URL } from '$lib/utils/base-url';

const NETWORK_NAMES = {
  [1]: 'homestead',
  [11155111]: 'sepolia',
};

const NETWORK_LABELS = {
  [1]: 'Ethereum Mainnet',
  [11155111]: 'Ethereum Sepolia',
};

const NETWORK_TOKENS = {
  [1]: 'ETH',
  [11155111]: 'ETH',
};

const NETWORK_ID = {
  [1]: '0x1',
  [11155111]: '0xaa36a7',
};

console.log("BASE URL", BASE_URL)

const RPC_URLS = {
  [1]: `${BASE_URL}/api/infura/mainnet`,
  [11155111]: `${BASE_URL}/api/infura/sepolia`,
};

// Networks currently supported by the app
type ChainId = 1 | 11155111;

function isSupportedChainId(chainId: number): chainId is ChainId {
  const CHAIN_IDS = [1, 11155111];

  return CHAIN_IDS.includes(chainId);
}

const configuredChainId = Number(PUBLIC_NETWORK);
assert(
  isSupportedChainId(configuredChainId),
  'Missing or invalid PUBLIC_NETWORK env variable. See DEVELOPMENT.md for more information.',
);

export function isConfiguredChainId(chainId: number): boolean {
  return chainId === configuredChainId;
}

export default {
  chainId: configuredChainId,
  name: NETWORK_NAMES[configuredChainId],
  label: NETWORK_LABELS[configuredChainId],
  token: NETWORK_TOKENS[configuredChainId],
  id: NETWORK_ID[configuredChainId],
  rpcUrl: RPC_URLS[configuredChainId],
};

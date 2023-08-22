import { PUBLIC_NETWORK } from '$env/static/public';
import assert from '$lib/utils/assert';

const NETWORK_NAMES = {
  [1]: 'homestead',
  [5]: 'goerli',
  [11155111]: 'sepolia',
};

const NETWORK_LABELS = {
  [1]: 'Ethereum Mainnet',
  [5]: 'Ethereum Goerli',
  [11155111]: 'Ethereum Sepolia',
};

const NETWORK_TOKENS = {
  [1]: 'ETH',
  [5]: 'ETH',
  [11155111]: 'ETH',
};

const NETWORK_ID = {
  [1]: '0x1',
  [5]: '0x5',
  [11155111]: '0xaa36a7',
};

const RPC_URLS = {
  [1]: 'https://mainnet.infura.io/v3/f88a1229d473471bbf94d168401b9c93',
  [5]: 'https://goerli.infura.io/v3/f88a1229d473471bbf94d168401b9c93',
  [11155111]: 'https://sepolia.infura.io/v3/f88a1229d473471bbf94d168401b9c93',
};

// Networks currently supported by the app
type ChainId = 1 | 5 | 11155111;

function isSupportedChainId(chainId: number): chainId is ChainId {
  const CHAIN_IDS = [1, 5, 11155111];

  return CHAIN_IDS.includes(chainId);
}

const configuredChainId = Number(PUBLIC_NETWORK);
assert(isSupportedChainId(configuredChainId));

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

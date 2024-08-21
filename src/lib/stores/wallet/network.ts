import { PUBLIC_NETWORK } from '$env/static/public';
import Base from '$lib/components/icons/networks/Base.svelte';
import Ethereum from '$lib/components/icons/networks/Ethereum.svelte';
import Filecoin from '$lib/components/icons/networks/Filecoin.svelte';
import Optimism from '$lib/components/icons/networks/Optimism.svelte';
import Polygon from '$lib/components/icons/networks/Polygon.svelte';
import { SupportedChain } from '$lib/graphql/__generated__/base-types';
import assert from '$lib/utils/assert';
import { BASE_URL } from '$lib/utils/base-url';
import type { ComponentType } from 'svelte';

export const SUPPORTED_CHAIN_IDS = [1, 80002, 11155420, 11155111, 84532, 314] as const;
export type ChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export type Network = {
  chainId: ChainId;
  name: string;
  label: string;
  token: string;
  id: string;
  rpcUrl: string;
  icon: ComponentType;
  color: string;
  isTestnet: boolean;
  subdomain: string;
  gqlName: SupportedChain;
};

export type ValueForEachSupportedChain<T> = Record<(typeof SUPPORTED_CHAIN_IDS)[number], T>;

const NETWORK_IS_TESTNET: ValueForEachSupportedChain<boolean> = {
  [1]: false,
  [80002]: true,
  [11155420]: true,
  [11155111]: true,
  [84532]: true,
  [314]: false,
};

const NETWORK_SUBDOMAIN: ValueForEachSupportedChain<string> = {
  [1]: 'drips.network',
  [80002]: 'amoy.drips.network',
  [11155420]: 'optimism-sepolia.drips.network',
  [11155111]: 'sepolia.drips.network',
  [84532]: 'base-sepolia.drips.network',
  [314]: 'filecoin.drips.network',
};

const NETWORK_ICONS: ValueForEachSupportedChain<ComponentType> = {
  [1]: Ethereum,
  [80002]: Polygon,
  [11155420]: Optimism,
  [11155111]: Ethereum,
  [84532]: Base,
  [314]: Filecoin,
};

const NETWORK_COLORS: ValueForEachSupportedChain<string> = {
  [1]: '#627EEA',
  [80002]: '#627EEA',
  [11155420]: '#627EEA',
  [11155111]: '#627EEA',
  [84532]: '#627EEA',
  [314]: '#627EEA',
};

const NETWORK_GQL_NAMES: ValueForEachSupportedChain<SupportedChain> = {
  [1]: SupportedChain.Mainnet,
  [80002]: SupportedChain.PolygonAmoy,
  [11155420]: SupportedChain.OptimismSepolia,
  [11155111]: SupportedChain.Sepolia,
  [84532]: SupportedChain.BaseSepolia,
  [314]: SupportedChain.Filecoin,
};

const NETWORK_NAMES: ValueForEachSupportedChain<string> = {
  [1]: 'homestead',
  [80002]: 'amoy',
  [11155420]: 'optimism-sepolia',
  [11155111]: 'sepolia',
  [84532]: 'base-sepolia',
  [314]: 'filecoin',
};

const NETWORK_LABELS: ValueForEachSupportedChain<string> = {
  [1]: 'Ethereum Mainnet',
  [80002]: 'Polygon Amoy',
  [11155420]: 'OP Sepolia',
  [11155111]: 'Sepolia',
  [84532]: 'Base Sepolia',
  [314]: 'Filecoin',
};

const NETWORK_TOKENS: ValueForEachSupportedChain<string> = {
  [1]: 'ETH',
  [80002]: 'MATIC',
  [11155420]: 'ETH',
  [11155111]: 'ETH',
  [84532]: 'ETH',
  [314]: 'FIL',
};

const NETWORK_ID: ValueForEachSupportedChain<string> = {
  [1]: '0x1',
  [80002]: '0x13882',
  [11155420]: '0xaa37dc',
  [11155111]: '0xaa36a7',
  [84532]: '0x14a34',
  [314]: '0x13a',
};

const RPC_URLS: ValueForEachSupportedChain<string> = {
  [1]: `${BASE_URL}/api/infura/mainnet`,
  [80002]: `${BASE_URL}/api/infura/polygon-amoy`,
  [11155420]: `${BASE_URL}/api/infura/optimism-sepolia`,
  [11155111]: `${BASE_URL}/api/infura/sepolia`,
  [84532]: `${BASE_URL}/api/infura/base-sepolia`,
  [314]: `https://api.node.glif.io/`,
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
    icon: NETWORK_ICONS[chainId],
    color: NETWORK_COLORS[chainId],
    isTestnet: NETWORK_IS_TESTNET[chainId],
    subdomain: NETWORK_SUBDOMAIN[chainId],
    gqlName: NETWORK_GQL_NAMES[chainId],
  };
}

export default getNetwork(configuredChainId);

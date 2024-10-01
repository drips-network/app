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

export type AutoUnwrapPair = {
  name: string;
  nativeSymbol: string;
  wrappedSymbol: string;
};

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
  autoUnwrapPairs: AutoUnwrapPair[] | undefined;
  displayNetworkPicker: boolean;
};

export type ValueForEachSupportedChain<T> = Record<(typeof SUPPORTED_CHAIN_IDS)[number], T>;

const NETWORK_CONFIG: ValueForEachSupportedChain<Network> = {
  [1]: {
    chainId: 1,
    name: 'homestead',
    label: 'Ethereum Mainnet',
    token: 'ETH',
    id: '0x1',
    rpcUrl: `${BASE_URL}/api/infura/mainnet`,
    icon: Ethereum,
    color: '#627EEA',
    isTestnet: false,
    subdomain: 'drips.network',
    gqlName: SupportedChain.Mainnet,
    autoUnwrapPairs: [{ name: 'Ethereum', nativeSymbol: 'ETH', wrappedSymbol: 'WETH' }],
    displayNetworkPicker: false,
  },
  [80002]: {
    chainId: 80002,
    name: 'amoy',
    label: 'Polygon Amoy',
    token: 'MATIC',
    id: '0x13882',
    rpcUrl: `${BASE_URL}/api/infura/polygon-amoy`,
    icon: Polygon,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'amoy.drips.network',
    gqlName: SupportedChain.PolygonAmoy,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
  },
  [11155420]: {
    chainId: 11155420,
    name: 'optimism-sepolia',
    label: 'OP Sepolia',
    token: 'ETH',
    id: '0xaa37dc',
    rpcUrl: `${BASE_URL}/api/infura/optimism-sepolia`,
    icon: Optimism,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'optimism-sepolia.drips.network',
    gqlName: SupportedChain.OptimismSepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
  },
  [11155111]: {
    chainId: 11155111,
    name: 'sepolia',
    label: 'Sepolia',
    token: 'ETH',
    id: '0xaa36a7',
    rpcUrl: `${BASE_URL}/api/infura/sepolia`,
    icon: Ethereum,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'sepolia.drips.network',
    gqlName: SupportedChain.Sepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
  },
  [84532]: {
    chainId: 84532,
    name: 'base-sepolia',
    label: 'Base Sepolia',
    token: 'ETH',
    id: '0x14a34',
    rpcUrl: `${BASE_URL}/api/infura/base-sepolia`,
    icon: Base,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'base-sepolia.drips.network',
    gqlName: SupportedChain.BaseSepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
  },
  [314]: {
    chainId: 314,
    name: 'filecoin',
    label: 'Filecoin',
    token: 'FIL',
    id: '0x13a',
    rpcUrl: 'https://api.node.glif.io/',
    icon: Filecoin,
    color: '#627EEA',
    isTestnet: false,
    subdomain: 'filecoin.drips.network',
    gqlName: SupportedChain.Filecoin,
    autoUnwrapPairs: [{ name: 'Filecoin', nativeSymbol: 'FIL', wrappedSymbol: 'WFIL' }],
    displayNetworkPicker: true,
  },
};

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

  return NETWORK_CONFIG[chainId];
}

export default getNetwork(configuredChainId);

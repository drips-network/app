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
  applyGasBuffers: boolean;
  contracts: {
    ADDRESS_DRIVER: string;
    DRIPS: string;
    CALLER: string;
    REPO_DRIVER: string;
    NFT_DRIVER: string;
    NATIVE_TOKEN_UNWRAPPER: string | undefined;
  };
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
    applyGasBuffers: true,
    contracts: {
      ADDRESS_DRIVER: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
      DRIPS: '0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4',
      CALLER: '0x60F25ac5F289Dc7F640f948521d486C964A248e5',
      REPO_DRIVER: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
      NFT_DRIVER: '0xcf9c49B0962EDb01Cdaa5326299ba85D72405258',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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
    applyGasBuffers: true,
    contracts: {
      ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
      REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
      NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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
    applyGasBuffers: true,
    contracts: {
      ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
      REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
      NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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
    applyGasBuffers: true,
    contracts: {
      ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
      REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
      NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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
    applyGasBuffers: true,
    contracts: {
      ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
      REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
      NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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
    applyGasBuffers: false,
    contracts: {
      ADDRESS_DRIVER: '0xE13A4f3671ee451F81Df3aa1AEb6653e4c33D5e0',
      DRIPS: '0x29252acF5a3dA105CB3aC245B7758F6e50281ba7',
      CALLER: '0x6171a47dDc84AF3e138D6d84c5b5D1bFD35615a3',
      REPO_DRIVER: '0x249e35aC49ccC4B1F0688Bc4c0bFA866a1b1E3fE',
      NFT_DRIVER: '0xE03d510d927816f3482C3C0204F14203403c0ee2',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
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

import { PUBLIC_NETWORK } from '$env/static/public';
import Base from '$lib/components/icons/networks/Base.svelte';
import Ethereum from '$lib/components/icons/networks/Ethereum.svelte';
import Filecoin from '$lib/components/icons/networks/Filecoin.svelte';
import Optimism from '$lib/components/icons/networks/Optimism.svelte';
import Polygon from '$lib/components/icons/networks/Polygon.svelte';
import { SupportedChain } from '$lib/graphql/__generated__/base-types';
import assert from '$lib/utils/assert';
import { BASE_URL } from '$lib/utils/base-url';
import { nextFilecoinSettlementDate, nextMainnetSettlementDate } from '$lib/utils/settlement-date';
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
  fallbackRpcUrl?: string;
  icon: ComponentType;
  color: string;
  isTestnet: boolean;
  subdomain: string;
  gqlName: SupportedChain;
  autoUnwrapPairs: AutoUnwrapPair[] | undefined;
  displayNetworkPicker: boolean;
  applyGasBuffers: boolean;
  settlement: {
    nextSettlementDate: () => Date;
    explainerText: string;
  };
  explorer: {
    name: string;
    linkTemplate: (txHash: string, networkName: string) => string;
  };
  contracts: {
    ADDRESS_DRIVER: string;
    DRIPS: string;
    CALLER: string;
    REPO_DRIVER: string;
    NFT_DRIVER: string;
    NATIVE_TOKEN_UNWRAPPER: string | undefined;
  };
  /**
   * If enabled, LP, blog, and legal routes are redirected to https://drips.network/<path>.
   * This will be obsolete once the app goes fully multi-chain, without separate deployments per network.
   */
  alternativeChainMode: boolean;
  ensSupported: boolean;
  ensAddress: string | undefined;
  gaslessClaimAndCollect: boolean;
};

export type ValueForEachSupportedChain<T> = Record<(typeof SUPPORTED_CHAIN_IDS)[number], T>;

const etherscanLinkTemplate = (txHash: string, networkName: string) =>
  networkName === 'homestead'
    ? `https://etherscan.io/tx/${txHash}`
    : `https://${networkName}.etherscan.io/tx/${txHash}`;

export const NETWORK_CONFIG: ValueForEachSupportedChain<Network> = {
  [1]: {
    chainId: 1,
    name: 'homestead',
    label: 'Ethereum',
    token: 'ETH',
    id: '0x1',
    rpcUrl: `${BASE_URL}/api/rpc/alchemy/mainnet`,
    fallbackRpcUrl: `${BASE_URL}/api/rpc/infura/mainnet`,
    icon: Ethereum,
    color: '#627EEA',
    isTestnet: false,
    subdomain: 'drips.network',
    gqlName: SupportedChain.Mainnet,
    autoUnwrapPairs: [{ name: 'Ethereum', nativeSymbol: 'ETH', wrappedSymbol: 'WETH' }],
    displayNetworkPicker: true,
    applyGasBuffers: true,
    explorer: {
      name: 'Etherscan',
      linkTemplate: etherscanLinkTemplate,
    },
    contracts: {
      ADDRESS_DRIVER: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
      DRIPS: '0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4',
      CALLER: '0x60F25ac5F289Dc7F640f948521d486C964A248e5',
      REPO_DRIVER: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
      NFT_DRIVER: '0xcf9c49B0962EDb01Cdaa5326299ba85D72405258',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
    settlement: {
      nextSettlementDate: nextMainnetSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable on the last Thursday of each month.',
    },
    alternativeChainMode: false,
    ensSupported: true,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    gaslessClaimAndCollect: false,
  },
  [80002]: {
    chainId: 80002,
    name: 'amoy',
    label: 'Polygon Amoy',
    token: 'MATIC',
    id: '0x13882',
    rpcUrl: `${BASE_URL}/api/rpc/infura/polygon-amoy`,
    fallbackRpcUrl: `${BASE_URL}/api/rpc/alchemy/polygon-amoy`,
    icon: Polygon,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'amoy.drips.network',
    gqlName: SupportedChain.PolygonAmoy,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
    applyGasBuffers: true,
    explorer: {
      name: 'Etherscan',
      linkTemplate: etherscanLinkTemplate,
    },
    contracts: {
      ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
      REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
      NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
    settlement: {
      nextSettlementDate: nextMainnetSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable on the last Thursday of each month.',
    },
    alternativeChainMode: true,
    ensSupported: false,
    ensAddress: undefined,
    gaslessClaimAndCollect: false,
  },
  [11155420]: {
    chainId: 11155420,
    name: 'optimism-sepolia',
    label: 'OP Sepolia',
    token: 'ETH',
    id: '0xaa37dc',
    rpcUrl: `${BASE_URL}/api/rpc/infura/optimism-sepolia`,
    fallbackRpcUrl: `${BASE_URL}/api/rpc/alchemy/optimism-sepolia`,
    icon: Optimism,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'optimism-sepolia.drips.network',
    gqlName: SupportedChain.OptimismSepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
    applyGasBuffers: true,
    explorer: {
      name: 'Etherscan',
      linkTemplate: etherscanLinkTemplate,
    },
    contracts: {
      ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
      REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
      NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
    settlement: {
      nextSettlementDate: nextMainnetSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable on the last Thursday of each month.',
    },
    alternativeChainMode: true,
    ensSupported: false,
    ensAddress: undefined,
    gaslessClaimAndCollect: false,
  },
  [11155111]: {
    chainId: 11155111,
    name: 'sepolia',
    label: 'Sepolia',
    token: 'ETH',
    id: '0xaa36a7',
    rpcUrl: `${BASE_URL}/api/rpc/infura/sepolia`,
    fallbackRpcUrl: `${BASE_URL}/api/rpc/alchemy/sepolia`,
    icon: Ethereum,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'sepolia.drips.network',
    gqlName: SupportedChain.Sepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: true,
    applyGasBuffers: true,
    explorer: {
      name: 'Etherscan',
      linkTemplate: etherscanLinkTemplate,
    },
    contracts: {
      ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      DRIPS: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      CALLER: '0x09e04Cb8168bd0E8773A79Cc2099f19C46776Fee',
      REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
      NFT_DRIVER: '0xdC773a04C0D6EFdb80E7dfF961B6a7B063a28B44',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
    settlement: {
      nextSettlementDate: nextMainnetSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable on the last Thursday of each month.',
    },
    alternativeChainMode: false,
    ensSupported: true,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    gaslessClaimAndCollect: true,
  },
  [84532]: {
    chainId: 84532,
    name: 'base-sepolia',
    label: 'Base Sepolia',
    token: 'ETH',
    id: '0x14a34',
    rpcUrl: `${BASE_URL}/api/rpc/infura/base-sepolia`,
    fallbackRpcUrl: `${BASE_URL}/api/rpc/alchemy/base-sepolia`,
    icon: Base,
    color: '#627EEA',
    isTestnet: true,
    subdomain: 'base-sepolia.drips.network',
    gqlName: SupportedChain.BaseSepolia,
    autoUnwrapPairs: [],
    displayNetworkPicker: false,
    applyGasBuffers: true,
    explorer: {
      name: 'Etherscan',
      linkTemplate: etherscanLinkTemplate,
    },
    contracts: {
      ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      DRIPS: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      CALLER: '0x5C7c5AA20b15e13229771CB7De36Fe1F54238372',
      REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
      NFT_DRIVER: '0xDafd9Ab96E62941808caa115D184D30A200FA777',
      NATIVE_TOKEN_UNWRAPPER: undefined,
    },
    settlement: {
      nextSettlementDate: nextMainnetSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable on the last Thursday of each month.',
    },
    alternativeChainMode: true,
    ensSupported: false,
    ensAddress: undefined,
    gaslessClaimAndCollect: false,
  },
  [314]: {
    chainId: 314,
    name: 'filecoin',
    label: 'Filecoin',
    token: 'FIL',
    id: '0x13a',
    rpcUrl: `${BASE_URL}/api/rpc/glif/filecoin-mainnet`,
    icon: Filecoin,
    color: '#627EEA',
    isTestnet: false,
    subdomain: 'filecoin.drips.network',
    gqlName: SupportedChain.Filecoin,
    autoUnwrapPairs: [{ name: 'Filecoin', nativeSymbol: 'FIL', wrappedSymbol: 'WFIL' }],
    displayNetworkPicker: true,
    applyGasBuffers: false,
    explorer: {
      name: 'Blockscout',
      linkTemplate: (txHash: string) => `https://filecoin.blockscout.com/tx/${txHash}`,
    },
    contracts: {
      ADDRESS_DRIVER: '0x04693D13826a37dDdF973Be4275546Ad978cb9EE',
      DRIPS: '0xd320F59F109c618b19707ea5C5F068020eA333B3',
      CALLER: '0xd6Ab8e72dE3742d45AdF108fAa112Cd232718828',
      REPO_DRIVER: '0xe75f56B26857cAe06b455Bfc9481593Ae0FB4257',
      NFT_DRIVER: '0x2F23217A87cAf04ae586eed7a3d689f6C48498dB',
      NATIVE_TOKEN_UNWRAPPER: '0x64e0d60C70e9778C2E649FfBc90259C86a6Bf396',
    },
    settlement: {
      nextSettlementDate: nextFilecoinSettlementDate,
      explainerText:
        'Funds from projects, streams and Drip Lists settle and become collectable daily.',
    },
    alternativeChainMode: true,
    ensSupported: false,
    ensAddress: undefined,
    gaslessClaimAndCollect: true,
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

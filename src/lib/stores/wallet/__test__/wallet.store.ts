import { ethers, JsonRpcProvider } from 'ethers';
import { readable } from 'svelte/store';
import type { ConnectedWalletStoreState } from '../wallet.store';
import Ethereum from '$lib/components/icons/networks/Ethereum.svelte';
import { SupportedChain } from '$lib/graphql/__generated__/base-types';
import { nextMainnetSettlementDate } from '$lib/utils/settlement-date';

const NETWORK = {
  chainId: 11155111 as const,
  name: 'sepolia',
  label: 'Sepolia',
  token: 'ETH',
  id: '0xaa36a7',
  rpcUrl: 'http://127.0.0.1:8545',
  icon: Ethereum,
  color: '#627EEA',
  isTestnet: true,
  subdomain: 'sepolia.drips.network',
  gqlName: SupportedChain.Sepolia,
  autoUnwrapPairs: undefined,
  displayNetworkPicker: false,
  applyGasBuffers: false,
  explorer: {
    name: 'Etherscan',
    linkTemplate: () => '',
  },
  contracts: {
    ADDRESS_DRIVER: '0xcc137285FD4D8914Dae08629086309B89aA6FDef',
    DRIPS: '0xa0523b86472561f0859d84C094cc04e6c4B33169',
    CALLER: '0xaBf7431BFC75BAD19AA98911c4dd7165b619771F',
    REPO_DRIVER: '0xb9C8e18E82687a564Ac4D26E22D28a4C95057CE9',
    NFT_DRIVER: '0xc95eb214845d5693abc750692161CB008796ae5C',
    NATIVE_TOKEN_UNWRAPPER: undefined,
  },
  settlement: {
    nextSettlementDate: nextMainnetSettlementDate,
    recipientsExplainerHtml: '<span>test</span>',
    explainerText: '',
  },
  alternativeChainMode: false,
  ensSupported: false,
  ensAddress: undefined,
  gaslessClaimAndCollect: false,
};

const provider = new JsonRpcProvider('http://127.0.0.1:8545', NETWORK, {
  staticNetwork: true,
});

const signer = new ethers.Wallet(
  '0x9e72e5257645bebc6e3423696be498c6973cc23cee4aaad507d04331d51fcef6',
  provider,
);

export default (() => {
  const state = readable<ConnectedWalletStoreState>({
    connected: true,
    address: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
    provider,
    signer: signer as unknown as ethers.JsonRpcSigner,
    dripsAccountId: '794608645470684755422591474294308388755542020991',
    network: NETWORK,
  });

  return {
    subscribe: state.subscribe,
    initialize: async () => {
      await provider.ready;
    },
    connect: async () => await provider.ready,
    disconnect: () => undefined,
  };
})();

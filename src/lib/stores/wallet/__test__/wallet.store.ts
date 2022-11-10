import { ethers, providers } from 'ethers';
import { readable } from 'svelte/store';
import type { ConnectedWalletStoreState } from '../wallet.store';

const NETWORK = {
  chainId: 5,
  name: 'Goerli',
};

const provider = new providers.StaticJsonRpcProvider(
  {
    url: 'http://localhost:8545',
    skipFetchSetup: true,
  },
  NETWORK,
);

const signer = new ethers.Wallet(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  provider,
);

export default (() => {
  const state = readable<ConnectedWalletStoreState>({
    connected: true,
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    provider,
    signer,
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

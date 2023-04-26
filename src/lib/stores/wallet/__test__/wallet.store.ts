import { ethers, providers } from 'ethers';
import { readable } from 'svelte/store';
import type { ConnectedWalletStoreState } from '../wallet.store';

const NETWORK = {
  chainId: 5,
  name: 'Goerli',
};

const provider = new providers.StaticJsonRpcProvider(
  {
    url: 'http://127.0.0.1:8545',
    skipFetchSetup: true,
  },
  NETWORK,
);

const signer = new ethers.Wallet(
  '0x9e72e5257645bebc6e3423696be498c6973cc23cee4aaad507d04331d51fcef6',
  provider,
);

export default (() => {
  const state = readable<ConnectedWalletStoreState>({
    connected: true,
    address: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
    provider,
    signer: signer as unknown as ethers.providers.JsonRpcSigner,
    dripsUserId: '794608645470684755422591474294308388755542020991',
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

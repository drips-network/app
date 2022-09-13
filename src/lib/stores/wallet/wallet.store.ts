import { ethers } from 'ethers';
import type { Network } from '@ethersproject/networks';
import Web3Modal from 'web3modal';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

const INFURA_ID = 'aadcb5b20a6e4cc09edfdd664ed6334c';

const WEB_3_MODAL_PROVIDER_OPTIONS = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
};

type WalletStoreState = {
  connected: true;
  address: string;
  provider: ethers.providers.Web3Provider;
  signer: ethers.Signer;
  network: Network;
};

export default (() => {
  const state = writable<WalletStoreState | undefined>(undefined);

  let web3Modal: Web3Modal;

  /**
   * Initialize the store and restore any previously-connected,
   * cached provider.
   */
  async function initialize(): Promise<void> {
    if (!browser) return;

    web3Modal = new Web3Modal({
      providerOptions: WEB_3_MODAL_PROVIDER_OPTIONS,
      cacheProvider: true,
    });

    if (web3Modal.cachedProvider) {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);

      _attachListeners(instance);
      await _setConnectedState(provider);
    }
  }

  /**
   * Trigger Web3Modal and let the user connect their wallet.
   */
  async function connect(): Promise<void> {
    if (!browser) throw new Error('Can only connect client-side');

    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance);

    _attachListeners(instance);
    await _setConnectedState(provider);
  }

  /**
   * Completely clear the store and drop any cached providers from
   * Web3Modal.
   */
  function disconnect(): void {
    _clear();
  }

  async function _setConnectedState(provider: ethers.providers.Web3Provider): Promise<void> {
    const accounts = await provider.listAccounts();
    const signer = provider.getSigner();

    state.set({
      connected: true,
      address: accounts[0],
      provider,
      signer,
      network: await provider.getNetwork(),
    });
  }

  function _clear() {
    web3Modal.clearCachedProvider();

    localStorage.removeItem('walletconnect');
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');

    state.set(undefined);
  }

  function _attachListeners(provider: ethers.providers.Web3Provider): void {
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        _clear();
        return;
      }

      state.update((s) => {
        if (!s) throw new Error('Accounts changed, but no wallet is connected');

        return {
          ...s,
          address: accounts[0],
        };
      });
    });

    provider.on('chainChanged', () => {
      window.location.reload();
    });

    provider.on('disconnect', () => {
      _clear();
    });
  }

  return {
    subscribe: state.subscribe,
    initialize,
    connect,
    disconnect,
  };
})();

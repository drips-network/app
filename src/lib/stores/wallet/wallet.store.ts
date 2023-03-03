import { ethers } from 'ethers';
import type { Network } from '@ethersproject/networks';
import Web3Modal from 'web3modal';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AddressDriverClient, Utils } from 'radicle-drips';

// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
import testnetMockProvider from './__test__/local-testnet-mock-provider';
import isTest from '$lib/utils/is-test';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
import globalAdvisoryStore from '../global-advisory/global-advisory.store';

import SafeAppsSDK from '$lib/stores/wallet/safe/sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import isRunningInSafe from '$lib/utils/is-running-in-safe';

const appsSdk = new SafeAppsSDK();

const { SUPPORTED_CHAINS } = Utils.Network;
const DEFAULT_NETWORK: Network = {
  chainId: 5,
  name: 'goerli',
};

const INFURA_ID = 'aadcb5b20a6e4cc09edfdd664ed6334c';

const WEB_3_MODAL_PROVIDER_OPTIONS = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
};

type SafeInfo = Awaited<ReturnType<typeof appsSdk.safe.getInfo>>;

export interface ConnectedWalletStoreState {
  connected: true;
  address: string;
  dripsUserId: string;
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
  signer: ethers.providers.JsonRpcSigner;
  network: Network;
  safe?: SafeInfo;
}

interface DisconnectedWalletStoreState {
  connected: false;
  network: Network;
  provider:
    | ethers.providers.Web3Provider
    | ethers.providers.InfuraProvider
    | ethers.providers.JsonRpcProvider;
  dripsUserId?: undefined;
  address?: undefined;
  signer?: undefined;
  safe?: undefined;
}

type WalletStoreState = ConnectedWalletStoreState | DisconnectedWalletStoreState;

const windowProvider =
  browser && window.ethereum && new ethers.providers.Web3Provider(window.ethereum);

const selectedNetwork =
  windowProvider && new ethers.providers.Web3Provider(window.ethereum).network;

const initNetwork =
  selectedNetwork && SUPPORTED_CHAINS.includes(selectedNetwork.chainId)
    ? selectedNetwork
    : DEFAULT_NETWORK;

const INITIAL_STATE: DisconnectedWalletStoreState = {
  connected: false,
  network: initNetwork,
  provider: new ethers.providers.InfuraProvider(initNetwork),
};

const walletStore = () => {
  const state = writable<WalletStoreState>(INITIAL_STATE);

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

    const isSafeApp = isRunningInSafe();

    if (web3Modal.cachedProvider || isSafeApp) {
      await connect(true, isSafeApp);
    }
  }

  /**
   * Trigger Web3Modal and let the user connect their wallet.
   * @param initializing If true, the function will trigger a global advisory
   * while waiting for the user's wallet to be unlocked.
   */
  async function connect(initializing = false, isSafeApp = false): Promise<void> {
    if (!browser) throw new Error('Can only connect client-side');

    let clearAdvisory: ReturnType<typeof globalAdvisoryStore.add> | undefined;
    let connected = false;

    setTimeout(() => {
      if (!initializing || connected) return;

      clearAdvisory = globalAdvisoryStore.add({
        fatal: false,
        headline: 'Waiting for wallet…',
        description: 'Please make sure your previously-connected wallet is unlocked.',
        emoji: '👛',
        button: {
          label: 'Disconnect wallet',
          handler: () => {
            disconnect();
            window.location.reload();
          },
        },
      });
    }, 250);

    let provider: ethers.providers.Web3Provider;
    let safeInfo: SafeInfo | undefined;

    if (isSafeApp) {
      safeInfo = await appsSdk.safe.getInfo();
      provider = new ethers.providers.Web3Provider(new SafeAppProvider(safeInfo, appsSdk));
    } else {
      const instance = await web3Modal.connect();
      provider = new ethers.providers.Web3Provider(instance);
      _attachListeners(instance);
    }

    connected = true;
    clearAdvisory?.();

    if (!_isNetworkSupported(await provider.getNetwork())) {
      const clearAdvisory = globalAdvisoryStore.add({
        fatal: false,
        headline: 'Unsupported network',
        description: 'Please switch your connected wallet to Ethereum Mainnet or Goerli.',
        emoji: '🔌',
      });

      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}` },
      ]);

      clearAdvisory();
    }

    await _setConnectedState(provider, safeInfo);
  }

  /**
   * Completely clear the store and drop any cached providers from
   * Web3Modal.
   */
  function disconnect(): void {
    _clear();
  }

  function _isNetworkSupported(network: Network): boolean {
    return SUPPORTED_CHAINS.includes(network.chainId);
  }

  async function _setConnectedState(
    provider: ethers.providers.Web3Provider,
    safeInfo?: SafeInfo,
  ): Promise<void> {
    const accounts = await provider.listAccounts();
    const signer = provider.getSigner();

    state.set({
      connected: true,
      address: accounts[0],
      dripsUserId: await (await AddressDriverClient.create(provider, signer)).getUserId(),
      provider,
      signer,
      network: await provider.getNetwork(),
      safe: safeInfo,
    });
  }

  function _clear() {
    web3Modal?.clearCachedProvider();

    localStorage.removeItem('walletconnect');
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');

    state.set(INITIAL_STATE);
  }

  function _attachListeners(provider: ethers.providers.Web3Provider): void {
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        _clear();
        return;
      }

      window.location.reload();
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
};

const mockWalletStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const address = (window as any).playwrightAddress ?? '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
  const provider = testnetMockProvider(address);

  const state = writable<WalletStoreState>({
    connected: false,
    network: provider.network,
    provider,
  });

  async function initialize() {
    const signer = provider.getSigner();
    const userId = await (await getAddressDriverClient(signer)).getUserId();

    state.set({
      connected: true,
      address,
      provider,
      signer,
      network: provider.network,
      dripsUserId: userId,
    });
  }

  return {
    subscribe: state.subscribe,
    initialize,
    connect: () => undefined,
    disconnect: () => undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default isTest() ? mockWalletStore() : walletStore();

import { ethers } from 'ethers';
import type { Network } from '@ethersproject/networks';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AddressDriverClient, Utils } from 'radicle-drips';
import Onboard, { type EIP1193Provider } from '@web3-onboard/core';
import injectedWallets from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

import testnetMockProvider from './__test__/local-testnet-mock-provider';
import isTest from '$lib/utils/is-test';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
import globalAdvisoryStore from '../global-advisory/global-advisory.store';

import SafeAppsSDK from '$lib/stores/wallet/safe/sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import isRunningInSafe from '$lib/utils/is-running-in-safe';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';
import { isWalletUnlocked } from './utils/is-wallet-unlocked';

const appsSdk = new SafeAppsSDK();

const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/f88a1229d473471bbf94d168401b9c93';
const GOERLI_RPC_URL = 'https://goerli.infura.io/v3/f88a1229d473471bbf94d168401b9c93';

const { SUPPORTED_CHAINS } = Utils.Network;
const DEFAULT_NETWORK: Network = {
  chainId: 1,
  name: 'homestead',
};

type SupportedWallet = 'metamask' | 'walletconnect';

const injected = injectedWallets();

const onboard = Onboard({
  wallets: [
    injected,
    walletConnectModule({
      version: 2,
      projectId: 'c09f5d8545d67c604ccf454219fd8f4d',
      requiredChains: [1],
    }),
  ],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: MAINNET_RPC_URL,
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Ethereum Goerli',
      rpcUrl: GOERLI_RPC_URL,
    },
  ],
  accountCenter: {
    mobile: { enabled: false },
    desktop: { enabled: false },
  },
  notify: {
    enabled: false,
  },
  appMetadata: {
    name: 'Drips',
    description: 'Please select a wallet to connect to Drips',
    icon: '<svg height="100%"><image href="/assets/onboard-logo.png" height="100%" /></svg>',
  },
});

const lastConnectedWallet = storedWritable<SupportedWallet | undefined>(
  'last-connected-wallet',
  z.union([z.literal('walletconnect'), z.literal('metamask')]).optional(),
  undefined,
  !browser,
);

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

const initNetwork = DEFAULT_NETWORK;

const INITIAL_STATE: DisconnectedWalletStoreState = {
  connected: false,
  network: initNetwork,
  provider: new ethers.providers.InfuraProvider(initNetwork),
};

const walletStore = () => {
  const state = writable<WalletStoreState>(INITIAL_STATE);

  /**
   * Initialize the store and restore any previously-connected,
   * cached connection.
   */
  async function initialize(): Promise<void> {
    if (!browser) return;

    const isSafeApp = isRunningInSafe();

    if (isSafeApp) {
      await connect(true, isSafeApp);
    } else {
      if (onboard.state.get().wallets.length > 0) return;

      const label = get(lastConnectedWallet);
      if (!label) return;

      if (await isWalletUnlocked(label)) {
        const wallets = await onboard.connectWallet({ autoSelect: { label, disableModals: true } });

        const provider = new ethers.providers.Web3Provider(wallets[0].provider);
        _attachListeners(wallets[0].provider);
        _setConnectedState(provider);
      }
    }
  }

  /**
   * Trigger Onboard and let the user connect their wallet.
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
      const wallets = await onboard.connectWallet();

      const wallet = wallets[0];
      const walletName = wallet.label.toLowerCase();

      const walletSupported = (label: string): label is SupportedWallet => {
        return ['metamask', 'walletconnect'].includes(label);
      };

      if (!walletSupported(walletName)) {
        throw new Error('Somehow tried to connect an unsupported wallet.');
      }

      lastConnectedWallet.set(walletName);

      provider = new ethers.providers.Web3Provider(wallets[0].provider);
      _attachListeners(wallets[0].provider);
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
   * Completely clear the store and drop any connected wallets.
   */
  function disconnect(): void {
    onboard.state.get().wallets.forEach((w) => {
      onboard.disconnectWallet({ label: w.label });
    });

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
    lastConnectedWallet.clear();
    state.set(INITIAL_STATE);
  }

  function _attachListeners(provider: EIP1193Provider): void {
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
    setOnboardTheme: onboard.state.actions.updateTheme,
  };
};

const mockWalletStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const address = (window as any).playwrightAddress ?? '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc';
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
    setOnboardTheme: () => undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default isTest() ? mockWalletStore() : walletStore();

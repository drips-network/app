import { JsonRpcProvider, JsonRpcSigner } from 'ethers';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import Onboard, { type EIP1193Provider } from '@web3-onboard/core';
import injectedWallets from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

import testnetMockProvider from './__test__/local-testnet-mock-provider';
import isTest from '$lib/utils/is-test';
import globalAdvisoryStore from '../global-advisory/global-advisory.store';

import SafeAppsSDK from '@safe-global/safe-apps-sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import isRunningInSafe from '$lib/utils/is-running-in-safe';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';
import { isWalletUnlocked } from './utils/is-wallet-unlocked';
import network, { getNetwork, isConfiguredChainId, type Network } from './network';
import { invalidateAll } from '../fetched-data-cache/invalidate';
import { BrowserProvider, InfuraProvider } from 'ethers';
import unreachable from '$lib/utils/unreachable';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { executeAddressDriverReadMethod } from '$lib/utils/sdk/address-driver/address-driver';

const appsSdk = new SafeAppsSDK();

const DEFAULT_NETWORK: Network = network;

const injected = injectedWallets();

const onboard = Onboard({
  wallets: [
    injected,
    walletConnectModule({
      version: 2,
      projectId: 'c09f5d8545d67c604ccf454219fd8f4d',
      requiredChains: [network.chainId],
      dappUrl: 'https://drips.network',
    }),
  ],
  chains: [
    {
      id: network.id,
      token: network.token,
      label: network.label,
      rpcUrl: network.rpcUrl,
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

const lastConnectedWallet = storedWritable<string | undefined>(
  'last-connected-wallet',
  z.string(),
  undefined,
  !browser,
);

type SafeInfo = Awaited<ReturnType<typeof appsSdk.safe.getInfo>>;

export interface ConnectedWalletStoreState {
  connected: true;
  address: string;
  dripsAccountId: string;
  provider: BrowserProvider | JsonRpcProvider;
  signer: JsonRpcSigner;
  network: Network;
  safe?: SafeInfo;
}

export interface DisconnectedWalletStoreState {
  connected: false;
  network: Network;
  provider: BrowserProvider | InfuraProvider | JsonRpcProvider;
  dripsAccountId?: undefined;
  address?: undefined;
  signer?: undefined;
  safe?: undefined;
}

type WalletStoreState = ConnectedWalletStoreState | DisconnectedWalletStoreState;

const INITIAL_STATE: DisconnectedWalletStoreState = {
  connected: false,
  network: DEFAULT_NETWORK,
  provider: new JsonRpcProvider(network.rpcUrl, DEFAULT_NETWORK),
};

const walletStore = () => {
  const state = writable<WalletStoreState>(INITIAL_STATE);
  const initialized = writable(false);
  const waitingForOnboard = writable(false);

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
      if (!label) {
        initialized.set(true);
        return;
      }

      if (await isWalletUnlocked(label)) {
        await connect(true, isSafeApp, { autoSelect: { label, disableModals: true } });
      }
    }

    initialized.set(true);
  }

  /**
   * Trigger Onboard and let the user connect their wallet.
   * @param initializing If true, the function will trigger a global advisory
   * while waiting for the user's wallet to be unlocked.
   */
  async function connect(
    initializing = false,
    isSafeApp = false,
    onboardOptions?: Parameters<typeof onboard.connectWallet>[0],
  ): Promise<void> {
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
    }, 2000);

    let provider: BrowserProvider;
    let safeInfo: SafeInfo | undefined;

    if (isSafeApp) {
      safeInfo = await appsSdk.safe.getInfo();
      provider = new BrowserProvider(new SafeAppProvider(safeInfo, appsSdk));
    } else {
      waitingForOnboard.set(true);
      const wallets = await onboard.connectWallet(onboardOptions);
      waitingForOnboard.set(false);

      const wallet = wallets[0];

      if (!wallet) return;

      const walletName = wallet.label.toLowerCase();

      lastConnectedWallet.set(walletName);

      provider = new BrowserProvider(wallets[0].provider);
      _attachListeners(wallets[0].provider);
    }

    connected = true;
    clearAdvisory?.();

    const connectedToNetwork = await provider.getNetwork();

    if (!isConfiguredChainId(Number(connectedToNetwork.chainId))) {
      // Try connecting to the default network to see if the network is already added.
      try {
        await provider.send('wallet_switchEthereumChain', [
          { chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}` },
        ]);
        // Network is already added, we can proceed.
        await _setConnectedState(provider, safeInfo);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Error code 4902 means that the network is not added to the wallet.
        if (error.error?.code === 4902) {
          // In this case, we also show the option to add the network to the wallet.
          clearAdvisory = globalAdvisoryStore.add({
            fatal: false,
            headline: 'Unsupported network',
            description: `Please add ${network.label} network to your connected wallet and switch to it, or disconnect the wallet.`,
            emoji: '🔌',
            button: {
              label: 'Disconnect wallet',
              handler: () => {
                disconnect();
                clearAdvisory?.();
              },
            },
            secondaryButton: {
              label: `Add ${network.label} to wallet`,
              handler: async () => {
                await provider.send('wallet_addEthereumChain', [
                  {
                    chainId: '0x13a',
                    blockExplorerUrls: ['https://filecoin.blockscout.com/'],
                    chainName: 'Filecoin',
                    nativeCurrency: {
                      decimals: 18,
                      name: 'Filecoin',
                      symbol: 'FIL',
                    },
                    rpcUrls: [
                      'https://api.node.glif.io/rpc/v1',
                      'https://filecoin.chainup.net/rpc/v1',
                      'https://rpc.ankr.com/filecoin',
                    ],
                  },
                ]);

                clearAdvisory?.();
              },
            },
          });
        } else {
          clearAdvisory = globalAdvisoryStore.add({
            fatal: false,
            headline: 'Unsupported network',
            description: `Please switch your connected wallet to ${network.label}, or disconnect the wallet.`,
            emoji: '🔌',
            button: {
              label: 'Disconnect wallet',
              handler: () => {
                disconnect();
                clearAdvisory?.();
              },
            },
          });
        }
      }
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

  async function _setConnectedState(provider: BrowserProvider, safeInfo?: SafeInfo): Promise<void> {
    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner();

    state.set({
      connected: true,
      address: accounts[0].address,
      dripsAccountId: (
        await executeAddressDriverReadMethod({
          functionName: 'calcAccountId',
          args: [signer.address as OxString],
        })
      ).toString(),
      provider,
      signer,
      network: getNetwork(Number((await provider.getNetwork()).chainId)),
      safe: safeInfo,
    });

    if (browser) {
      await invalidateAll();
    }
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
    initialized: { subscribe: initialized.subscribe },
    waitingForOnboard: { subscribe: waitingForOnboard.subscribe },
    initialize,
    connect,
    disconnect,
    setOnboardTheme: onboard.state.actions.updateTheme,
  };
};

const mockWalletStore = () => {
  const address =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browser && (window as any))?.playwrightAddress ?? '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc';
  const provider = testnetMockProvider(address);
  const initialized = writable(false);
  const waitingForOnboard = writable(false);

  const state = writable<WalletStoreState>({
    connected: false,
    network: getNetwork(Number(provider._network.chainId)),
    provider,
  });

  async function initialize() {
    const signer = await provider.getSigner();

    const ownAccountId = (
      await executeAddressDriverReadMethod({
        functionName: 'calcAccountId',
        args: [signer.address as OxString],
      })
    ).toString();

    const chainId = Number((await provider.getNetwork()).chainId ?? unreachable());

    state.set({
      connected: true,
      address,
      provider,
      signer,
      network: getNetwork(chainId),
      dripsAccountId: ownAccountId,
    });

    initialized.set(true);
  }

  return {
    subscribe: state.subscribe,
    initialized: { subscribe: initialized.subscribe },
    waitingForOnboard: { subscribe: waitingForOnboard.subscribe },
    initialize,
    connect: () => undefined,
    disconnect: () => undefined,
    setOnboardTheme: () => undefined,
  };
};

export default isTest() ? mockWalletStore() : walletStore();

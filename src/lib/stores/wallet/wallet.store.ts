import { ethers, providers } from 'ethers';
import type { Network } from '@ethersproject/networks';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AddressDriverClient } from 'radicle-drips';

// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import testnetMockProvider from './__test__/local-testnet-mock-provider';
import isTest from '$lib/utils/is-test';
import globalAdvisoryStore from '../global-advisory/global-advisory.store';

import SafeAppsSDK from '$lib/stores/wallet/safe/sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import isRunningInSafe from '$lib/utils/is-running-in-safe';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import {
  configureChains,
  createConfig,
  watchAccount,
  watchWalletClient,
  watchNetwork,
  getNetwork,
  type WalletClient,
  getWalletClient,
} from '@wagmi/core';
import { mainnet, goerli } from '@wagmi/core/chains';
import unreachable from '$lib/utils/unreachable';

const appsSdk = new SafeAppsSDK();

const DEFAULT_NETWORK: Network = {
  chainId: 1,
  name: 'homestead',
};

const WAGMI_CHAINS = [mainnet, goerli];
const WALLETCONNECT_PROJECT_ID = 'c09f5d8545d67c604ccf454219fd8f4d';

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

const INITIAL_STATE: DisconnectedWalletStoreState = {
  connected: false,
  network: DEFAULT_NETWORK,
  provider: new ethers.providers.InfuraProvider(DEFAULT_NETWORK),
};

const walletStore = () => {
  const state = writable<WalletStoreState>(INITIAL_STATE);

  let web3modal: Web3Modal;
  let ethereumClient: EthereumClient;

  const publicClient = configureChains(WAGMI_CHAINS, [
    w3mProvider({ projectId: WALLETCONNECT_PROJECT_ID }),
  ]).publicClient;
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
      projectId: WALLETCONNECT_PROJECT_ID,
      version: 1,
      chains: WAGMI_CHAINS,
    }),
    publicClient,
  });

  let isSafeApp: boolean | undefined;

  if (browser) {
    isSafeApp = isRunningInSafe();

    if (isSafeApp) {
      _initSafe();
    } else {
      ethereumClient = new EthereumClient(wagmiConfig, WAGMI_CHAINS);
      web3modal = new Web3Modal({ projectId: WALLETCONNECT_PROJECT_ID }, ethereumClient);
    }
  }

  let walletClientUnwatcher: () => void | undefined;

  if (!isSafeApp) {
    watchAccount(async (a) => {
      const { isConnected } = a;

      const chain = getNetwork().chain;

      if (isConnected && chain && !chain.unsupported) {
        const network = getNetwork();

        const walletClient = (await getWalletClient()) ?? unreachable();

        const provider = await _buildEthersProvider(walletClient);
        _setConnectedState(provider);

        walletClientUnwatcher = watchWalletClient(
          {
            chainId: network.chain?.id ?? unreachable(),
          },
          async (wc) => {
            if (!wc) return;

            const provider = await _buildEthersProvider(wc);
            _setConnectedState(provider);
          },
        );
      } else {
        walletClientUnwatcher?.();
        state.set(INITIAL_STATE);
      }
    });

    let unsupportedNetworkId: number | undefined;

    watchNetwork((n) => {
      const newChainId = n.chain?.id;

      if (n.chain?.unsupported) {
        globalAdvisoryStore.add({
          fatal: false,
          headline: 'Unsupported network',
          description: 'Please switch your connected wallet to Ethereum Mainnet or Goerli.',
          emoji: '🔌',
        });

        unsupportedNetworkId = n.chain.id;
      }

      const supportedChainChanged =
        newChainId && get(state).connected && newChainId !== get(state).network.chainId;
      const unsupportedChainChanged = unsupportedNetworkId && n.chain?.id !== unsupportedNetworkId;

      if (supportedChainChanged || unsupportedChainChanged) {
        window.location.reload();
      }
    });
  }

  function openModal() {
    web3modal.openModal();
  }

  async function _buildEthersProvider(wc: WalletClient) {
    const externalProvider: providers.ExternalProvider = {
      isMetaMask: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: async (request: { method: string; params?: Array<any> }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await wc?.request(request as any);
      },
    };

    const provider = new providers.Web3Provider(externalProvider);

    return provider;
  }

  async function _initSafe() {
    const safeInfo = await appsSdk.safe.getInfo();
    const provider = new ethers.providers.Web3Provider(new SafeAppProvider(safeInfo, appsSdk));

    _setConnectedState(provider, safeInfo);
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

  return {
    subscribe: state.subscribe,
    openModal,
  };
};

const mockWalletStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const address = (window as any).playwrightAddress ?? '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc';
  const provider = testnetMockProvider(address);
  const signer = provider.getSigner();

  const state = writable<WalletStoreState>({
    connected: true,
    address,
    provider,
    signer,
    network: provider.network,
    dripsUserId:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).playwrightDripsUserId ?? '383620263794848526656662033323214000554911775452',
  });

  return {
    subscribe: state.subscribe,
    connect: () => undefined,
    disconnect: () => undefined,
    openModal: () => undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default isTest() ? mockWalletStore() : walletStore();

import { writable } from 'svelte/store';
import { browser, dev } from '$app/environment';
import {
  createDripsSdk,
  type DripsSdk,
  type IpfsMetadataUploaderFn,
  type Metadata,
} from '@drips-network/sdk';
import walletStore from '../wallet/wallet.store';
import { pin } from '$lib/utils/ipfs';
import { BASE_URL } from '$lib/utils/base-url';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

export interface SDKStoreState {
  sdk: DripsSdk | null;
}

const INITIAL_STATE: SDKStoreState = {
  sdk: null,
};

function createSdkStore() {
  const state = writable<SDKStoreState>(INITIAL_STATE);

  walletStore.subscribe((walletState) => {
    if (!browser) return;

    try {
      const blockchainClient = walletState.connected ? walletState.signer : walletState.provider;

      const ipfsMetadataUploader: IpfsMetadataUploaderFn<Metadata> = async (metadata) => {
        return (await pin(metadata)) as `0x${string}`;
      };

      const PORT = getOptionalEnvVar('PUBLIC_PORT', false, null);
      const graphqlUrl =
        browser || dev ? `${BASE_URL}/api/gql` : `http://localhost:${PORT ?? '8080'}/api/gql`;

      const sdk = createDripsSdk(blockchainClient, ipfsMetadataUploader, {
        graphql: {
          url: graphqlUrl,
        },
      });

      state.set({ sdk });
    } catch (error) {
      console.error('Failed to initialize SDK:', error); // eslint-disable-line no-console
      state.set({ sdk: null });
    }
  });

  return {
    subscribe: state.subscribe,
  };
}

export default createSdkStore();

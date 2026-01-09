import { browser } from '$app/environment';
import {
  createDripsSdk,
  type DripsSdk,
  type IpfsMetadataUploaderFn,
  type Metadata,
} from '@drips-network/sdk';
import walletStore from '$lib/stores/wallet/wallet.store';
import { pin } from '$lib/utils/ipfs';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

export class SDKManager {
  private static instance: SDKManager;
  private _sdk: DripsSdk | null = null;
  private walletUnsubscribe?: () => void;

  private constructor() {
    if (browser) {
      this.initializeWalletSubscription();
    }
  }

  static getInstance(): SDKManager {
    if (!SDKManager.instance) {
      SDKManager.instance = new SDKManager();
    }
    return SDKManager.instance;
  }

  get sdk(): DripsSdk | null {
    return this._sdk;
  }

  private initializeWalletSubscription(): void {
    this.walletUnsubscribe = walletStore.subscribe((walletState) => {
      if (!browser) return;

      try {
        const blockchainClient = walletState.connected ? walletState.signer : walletState.provider;

        const ipfsMetadataUploader: IpfsMetadataUploaderFn<Metadata> = async (metadata) => {
          return (await pin(metadata)) as `0x${string}`;
        };

        const GQL_URL = getOptionalEnvVar('PUBLIC_GQL_URL', true);

        const sdk = createDripsSdk(blockchainClient, ipfsMetadataUploader, {
          graphql: {
            url: GQL_URL,
          },
        });

        this._sdk = sdk;
      } catch (error) {
        console.error('Failed to initialize SDK:', error); // eslint-disable-line no-console
        this._sdk = null;
      }
    });
  }

  destroy(): void {
    this.walletUnsubscribe?.();
    this._sdk = null;
  }
}

export const sdkManager = SDKManager.getInstance();

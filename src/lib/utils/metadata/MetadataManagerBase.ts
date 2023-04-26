import {
  getAddressDriverClient,
  getGitDriverClient,
  getNFTDriverClient,
  getSubgraphClient,
} from '$lib/utils/get-drips-clients';
import { fetchIpfs } from '$lib/utils/ipfs';
import isTest from '$lib/utils/is-test';
import type { ContractTransaction } from 'ethers';
import type {
  AddressDriverClient,
  DripsSubgraphClient,
  GitDriverClient,
  NFTDriverClient,
} from 'radicle-drips';
import type { z } from 'zod';
import {
  addressDriverAccountMetadataSchema,
  gitDriverAccountMetadataSchema,
  nftDriverAccountMetadataSchema,
} from './schemas';
import type { UserId } from '$lib/stores/streams/types';

export interface IMetadataManager<TAccountMetadataSchema extends z.ZodType, TAccount> {
  fetchMetadataHashByUserId(userId: UserId): Promise<string | undefined>;

  fetchAccountMetadata(
    userId: UserId,
  ): Promise<{ hash: string; data: z.infer<TAccountMetadataSchema> } | undefined>;

  pinAccountMetadata(data: z.infer<TAccountMetadataSchema>): Promise<string>;

  updateAccountMetadata<T extends z.ZodType>(
    newData: z.infer<T>,
    lastKnownHash: string | undefined,
    schema: T,
  ): Promise<{ newHash: string; tx: ContractTransaction }>;

  fetchAccount(userId: UserId): Promise<TAccount | null>;

  buildAccountMetadata(context: unknown): z.infer<TAccountMetadataSchema>;
}

export default abstract class MetadataManagerBase<
  TAccountMetadataSchema extends z.ZodType,
  TAccount,
> implements IMetadataManager<TAccountMetadataSchema, TAccount>
{
  public static readonly USER_METADATA_KEY = 'ipfs';

  private readonly _metadataSchema: TAccountMetadataSchema;
  protected readonly subgraphClient: DripsSubgraphClient;

  protected constructor(metadataSchema: TAccountMetadataSchema) {
    this._metadataSchema = metadataSchema;
    this.subgraphClient = getSubgraphClient();
  }

  /**
   * Fetches the account for a given user ID.
   * @param userId The user ID to fetch the account for.
   * @returns The account for the given user ID, or null if no account exists.
   */
  public abstract fetchAccount(userId: UserId): Promise<TAccount | null>;

  /**
   * Builds account metadata.
   * @param context The context to build the account metadata from.
   * @returns The built account metadata.
   */
  public abstract buildAccountMetadata(context: unknown): z.infer<TAccountMetadataSchema>;

  /**
   * Fetches the latest metadata hash for a given user ID.
   * @param userId The user ID to fetch the metadata hash for.
   * @returns The latest metadata hash for the given user ID, or undefined if no metadata hash exists.
   */
  public async fetchMetadataHashByUserId(userId: UserId): Promise<string | undefined> {
    const userMetadata = await this.subgraphClient.getLatestUserMetadata(
      userId,
      MetadataManagerBase.USER_METADATA_KEY,
    );

    return userMetadata?.value;
  }
  /**
   * Fetches the latest IPFS metadata for a given user ID.
   * @param userId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or undefined if no metadata exists.
   */
  public async fetchAccountMetadata(
    userId: UserId,
  ): Promise<{ hash: string; data: z.infer<TAccountMetadataSchema> } | undefined> {
    const metadataHash = await this.fetchMetadataHashByUserId(userId);

    if (!metadataHash) return undefined;

    if (isTest()) {
      const val = JSON.parse(localStorage.getItem(`mock_ipfs_${metadataHash}`) ?? '');
      return val;
    }

    let accountMetadataRes: Awaited<ReturnType<typeof fetchIpfs>>;
    try {
      accountMetadataRes = await (await fetchIpfs(metadataHash)).json();
    } catch (e) {
      return undefined;
    }

    return {
      hash: metadataHash,
      data: this._metadataSchema.parse(accountMetadataRes),
    };
  }
  /**
   * Pins account metadata to IPFS.
   * @param data The account metadata to pin.
   * @returns The IPFS hash of the pinned metadata.
   * @throws If the pinning fails.
   */
  public async pinAccountMetadata(data: z.infer<TAccountMetadataSchema>): Promise<string> {
    if (isTest()) {
      const mockHash = (Math.random() + 1).toString(36).substring(7);
      const mockData = JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );

      localStorage.setItem(`mock_ipfs_${mockHash}`, mockData);

      return mockHash;
    }

    const res = await fetch('/api/ipfs/pin', {
      method: 'POST',
      body: JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    });

    if (!res.ok) {
      throw new Error(`Pinning account metadata failed: ${await res.text()}`);
    }

    return res.text();
  }
  /**
   * Updates account metadata.
   * @param newData The new account metadata.
   * @param lastKnownHash The last known IPFS hash of the account metadata.
   * @returns The new IPFS hash of the account metadata, and the transaction that emitted the new metadata.
   * @throws If the last known hash doesn't match the on-chain value.
   * @throws If the update fails.
   */
  public async updateAccountMetadata<T extends z.ZodType>(
    newData: z.infer<T>,
    lastKnownHash: string | undefined,
  ): Promise<{ newHash: string; tx: ContractTransaction }> {
    const { userId } = newData.describes;
    const currentOnChainHash = await this.fetchMetadataHashByUserId(userId);

    if (currentOnChainHash !== lastKnownHash) {
      throw new Error(
        "Current metadata hash doesn't match on-chain value." +
          'If your account was edited elsewhere previously, please refresh the page before making further changes.',
      );
    }

    const newHash = await this.pinAccountMetadata(newData);

    const tx = await this.emitUserMetadata(newHash, userId);

    return {
      newHash,
      tx,
    };
  }

  private async emitUserMetadata(newHash: string, userId: UserId) {
    const userMetadata = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: newHash,
      },
    ];

    const client = await this.getClient(this._metadataSchema);

    let tx: ContractTransaction;
    if ('safeCreateAccount' in client) {
      tx = await (client as NFTDriverClient).emitUserMetadata(userId, userMetadata);
    } else if ('getUserId' in client) {
      tx = await (client as AddressDriverClient).emitUserMetadata(userMetadata);
    } else if ('getProjectId' in client) {
      tx = await (client as GitDriverClient).emitUserMetadata(userId, userMetadata);
    } else {
      throw new Error('Unsupported client');
    }

    return tx;
  }

  private async getClient(
    schema: z.ZodType,
  ): Promise<AddressDriverClient | NFTDriverClient | GitDriverClient> {
    if (schema === addressDriverAccountMetadataSchema) {
      return await getAddressDriverClient();
    } else if (schema === nftDriverAccountMetadataSchema) {
      return await getNFTDriverClient();
    } else if (schema === gitDriverAccountMetadataSchema) {
      return await getGitDriverClient();
    } else {
      throw new Error('Unsupported schema');
    }
  }
}

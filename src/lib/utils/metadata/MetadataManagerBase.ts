import {
  getAddressDriverClient,
  getRepoDriverClient,
  getNFTDriverClient,
  getSubgraphClient,
} from '$lib/utils/get-drips-clients';
import isTest from '$lib/utils/is-test';
import type { ContractTransaction } from 'ethers';
import type {
  AddressDriverClient,
  DripsSubgraphClient,
  RepoDriverClient,
  NFTDriverClient,
} from 'radicle-drips';
import type { z } from 'zod';
import {
  addressDriverAccountMetadataSchema,
  repoDriverAccountMetadataSchema,
  nftDriverAccountMetadataSchema,
} from './schemas';
import type { AccountId } from './types';
import { fetchIpfs as ipfsFetch } from '$lib/utils/ipfs';

type IpfsHash = string;

export interface IMetadataManager<TAccountMetadataSchema extends z.ZodType, TAccount> {
  fetchMetadataHashByAccountId(accountId: AccountId): Promise<string | null>;

  fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: IpfsHash; data: z.infer<TAccountMetadataSchema> } | null>;

  pinAccountMetadata(data: z.infer<TAccountMetadataSchema>): Promise<string>;

  updateAccountMetadata<T extends z.ZodType>(
    newData: z.infer<T>,
    lastKnownHash: IpfsHash | undefined,
    schema: T,
  ): Promise<{ newHash: IpfsHash; tx: ContractTransaction }>;

  fetchAccount(accountId: AccountId): Promise<TAccount | null>;

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
   * @param accountId The user ID to fetch the account for.
   * @returns The account for the given user ID, or null if no account exists.
   */
  public abstract fetchAccount(accountId: AccountId): Promise<TAccount | null>;

  /**
   * Builds account metadata.
   * @param context The context to build the account metadata from.
   * @returns The built account metadata.
   */
  public abstract buildAccountMetadata(context: unknown): z.infer<TAccountMetadataSchema>;

  /**
   * Fetches the latest metadata hash for a given user ID.
   * @param accountId The user ID to fetch the metadata hash for.
   * @returns The latest metadata hash for the given user ID, or null if no metadata hash exists.
   */
  public async fetchMetadataHashByAccountId(accountId: AccountId): Promise<string | null> {
    const accountMetadata = await this.subgraphClient.getLatestAccountMetadata(
      accountId,
      MetadataManagerBase.USER_METADATA_KEY,
    );

    return accountMetadata?.value ?? null;
  }

  private async fetchIpfs(hash: IpfsHash) {
    if (isTest()) {
      const val = JSON.parse(localStorage.getItem(`mock_ipfs_${hash}`) ?? '');
      return val;
    }

    return await (await ipfsFetch(hash)).json();
  }

  /**
   * Fetches the latest IPFS metadata for a given user ID.
   * @param accountId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or null if no metadata exists.
   */
  public async fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: IpfsHash; data: z.infer<TAccountMetadataSchema> } | null> {
    const metadataHash = await this.fetchMetadataHashByAccountId(accountId);
    if (!metadataHash) return null;

    let accountMetadataRes: Awaited<ReturnType<typeof MetadataManagerBase.prototype.fetchIpfs>>;

    try {
      accountMetadataRes = await this.fetchIpfs(metadataHash);
    } catch (e) {
      return null;
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
  public async pinAccountMetadata(data: z.infer<TAccountMetadataSchema>): Promise<IpfsHash> {
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
    lastKnownHash: IpfsHash | undefined,
  ): Promise<{ newHash: IpfsHash; tx: ContractTransaction }> {
    const { accountId } = newData.describes;
    const currentOnChainHash = await this.fetchMetadataHashByAccountId(accountId);

    if (currentOnChainHash !== lastKnownHash) {
      throw new Error(
        "Current metadata hash doesn't match on-chain value." +
          'If your account was edited elsewhere previously, please refresh the page before making further changes.',
      );
    }

    const newHash = await this.pinAccountMetadata(newData);

    const tx = await this.emitAccountMetadata(newHash, accountId);

    return {
      newHash,
      tx,
    };
  }

  private async emitAccountMetadata(newHash: IpfsHash, accountId: AccountId) {
    const accountMetadata = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: newHash,
      },
    ];

    const client = await this.getClient(this._metadataSchema);

    let tx: ContractTransaction;
    if ('safeCreateAccount' in client) {
      tx = await (client as NFTDriverClient).emitAccountMetadata(accountId, accountMetadata);
    } else if ('getAccountId' in client) {
      tx = await (client as AddressDriverClient).emitAccountMetadata(accountMetadata);
    } else if ('requestOwnerUpdate' in client) {
      tx = await (client as RepoDriverClient).emitAccountMetadata(accountId, accountMetadata);
    } else {
      throw new Error('Unsupported client');
    }

    return tx;
  }

  private async getClient(
    schema: z.ZodType,
  ): Promise<AddressDriverClient | NFTDriverClient | RepoDriverClient> {
    if (schema === addressDriverAccountMetadataSchema) {
      return await getAddressDriverClient();
    } else if (schema === nftDriverAccountMetadataSchema) {
      return await getNFTDriverClient();
    } else if (schema === repoDriverAccountMetadataSchema) {
      return await getRepoDriverClient();
    } else {
      throw new Error('Unsupported schema');
    }
  }
}

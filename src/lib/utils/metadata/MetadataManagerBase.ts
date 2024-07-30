import { toBigInt, type ContractTransaction } from 'ethers';
import type { z } from 'zod';
import { fetchIpfs as ipfsFetch } from '$lib/utils/ipfs';
import type { AnyVersion, LatestVersion, Parser } from '@efstajas/versioned-parser';
import assert from '$lib/utils/assert';
import type { executeNftDriverWriteMethod } from '../sdk/nft-driver/nft-driver';
import type { TransactionResponse } from 'ethers';
import keyValueToMetatada from '../sdk/utils/key-value-to-metadata';
import type { MetadataKeyValue } from '../sdk/sdk-types';

type IpfsHash = string;
type AccountId = string;

export interface IMetadataManager<TParser extends Parser> {
  fetchMetadataHashByAccountId(accountId: AccountId): Promise<string | null>;

  fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: IpfsHash; data: AnyVersion<TParser> } | null>;

  pinAccountMetadata(data: LatestVersion<TParser>): Promise<string>;

  updateAccountMetadata<T extends z.ZodType>(
    newData: z.infer<T>,
    lastKnownHash: IpfsHash | undefined,
    schema: T,
  ): Promise<{ newHash: IpfsHash; tx: TransactionResponse }>;

  buildAccountMetadata(context: unknown): LatestVersion<TParser>;
}

export type EmitMetadataFunc = (
  accountId: string,
  accountMetadata: MetadataKeyValue[],
) => Promise<ContractTransaction>;

export default abstract class MetadataManagerBase<TParser extends Parser>
  implements IMetadataManager<TParser>
{
  public static readonly USER_METADATA_KEY = 'ipfs';

  private readonly _parser: TParser;
  private readonly _emitMetadataFunc: typeof executeNftDriverWriteMethod | undefined;

  protected constructor(
    parser: TParser,
    emitMetadataFunc?: typeof executeNftDriverWriteMethod | typeof executeNftDriverWriteMethod,
  ) {
    this._parser = parser;
    this._emitMetadataFunc = emitMetadataFunc;
  }

  /**
   * Builds account metadata.
   * @param context The context to build the account metadata from.
   * @returns The built account metadata.
   */
  public abstract buildAccountMetadata(context: unknown): LatestVersion<TParser>;

  /**
   * Upgrades metadata in a format matching any version to the latest version. This is used to
   * ensure that metadata is in the latest format when updating an account that had previously
   * written metadata in an older format.
   * @param currentMetadata The current metadata to upgrade.
   * @returns The upgraded metadata.
   */
  public abstract upgradeAccountMetadata(
    currentMetadata: AnyVersion<TParser>,
  ): LatestVersion<TParser>;

  /**
   * Fetches the latest metadata hash for a given user ID.
   * @param accountId The user ID to fetch the metadata hash for.
   * @returns The latest metadata hash for the given user ID, or null if no metadata hash exists.
   */
  public abstract fetchMetadataHashByAccountId(accountId: AccountId): Promise<string | null>;

  private async fetchIpfs(hash: IpfsHash) {
    return await (await ipfsFetch(hash)).json();
  }

  /**
   * Fetches the latest IPFS metadata for a given user ID.
   * @param accountId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or null if no metadata exists.
   */
  public async fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: IpfsHash; data: AnyVersion<TParser> } | null> {
    const metadataHash = await this.fetchMetadataHashByAccountId(accountId);
    if (!metadataHash) return null;

    let accountMetadataRes: Awaited<ReturnType<typeof MetadataManagerBase.prototype.fetchIpfs>>;

    try {
      accountMetadataRes = await this.fetchIpfs(metadataHash);
    } catch {
      return null;
    }

    return {
      hash: metadataHash,
      data: this._parser.parseAny(accountMetadataRes) as AnyVersion<TParser>,
    };
  }

  /**
   * Pins account metadata to IPFS.
   * @param data The account metadata to pin.
   * @returns The IPFS hash of the pinned metadata.
   * @throws If the pinning fails.
   */
  public async pinAccountMetadata(data: LatestVersion<TParser>): Promise<IpfsHash> {
    // Ensure the data follows the correct schema at runtime
    this._parser.parseLatest(data);

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
   * @throws If the last known hash doesnʼt match the on-chain value.
   * @throws If the update fails.
   */
  public async updateAccountMetadata<T extends z.ZodType>(
    newData: z.infer<T>,
    lastKnownHash: IpfsHash | undefined,
  ): Promise<{ newHash: IpfsHash; tx: TransactionResponse }> {
    const { accountId } = newData.describes;
    const currentOnChainHash = await this.fetchMetadataHashByAccountId(accountId);

    if (currentOnChainHash !== lastKnownHash) {
      throw new Error(
        'Current metadata hash doesnʼt match on-chain value.' +
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
    assert(this._emitMetadataFunc, 'emitAccountMetadata called without emitMetadataFunc');

    const accountMetadata = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: newHash,
      },
    ].map(keyValueToMetatada);

    const tx = await this._emitMetadataFunc({
      functionName: 'emitAccountMetadata',
      args: [toBigInt(accountId), accountMetadata],
    });

    return tx;
  }
}

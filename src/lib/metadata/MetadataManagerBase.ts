import {
  getAddressDriverClient,
  getGitDriverClient,
  getNFTDriverClient,
  getSubgraphClient,
} from '$lib/utils/get-drips-clients';
import type { UserId } from '../stores/streams/types';
import isTest from '$lib/utils/is-test';
import { fetchIpfs } from '$lib/utils/ipfs';
import type { ContractTransaction } from 'ethers';
import type { z } from 'zod';
import type {
  AddressDriverClient,
  DripsSubgraphClient,
  GitDriverClient,
  NFTDriverClient,
} from 'radicle-drips';
import {
  addressDriverAccountMetadataSchema,
  gitDriverAccountMetadataSchema,
  nftDriverAccountMetadataSchema,
} from './schemas';

export interface IMetadataManager<TAccountMetadataSchema extends z.ZodType> {
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
}

export default abstract class MetadataManagerBase<TAccountMetadataSchema extends z.ZodType> {
  private readonly _metadataSchema: TAccountMetadataSchema;
  protected readonly subgraphClient: DripsSubgraphClient;

  public static readonly USER_METADATA_KEY = 'ipfs';

  protected constructor(metadataSchema: TAccountMetadataSchema);
  protected constructor(
    metadataSchema: TAccountMetadataSchema,
    subgraphClient?: DripsSubgraphClient,
  );
  protected constructor(
    metadataSchema: TAccountMetadataSchema,
    subgraphClient?: DripsSubgraphClient,
  ) {
    this._metadataSchema = metadataSchema;
    this.subgraphClient = subgraphClient ?? getSubgraphClient();
  }

  public async fetchMetadataHashByUserId(userId: UserId): Promise<string | undefined> {
    const userMetadata = await this.subgraphClient.getLatestUserMetadata(
      userId,
      MetadataManagerBase.USER_METADATA_KEY,
    );

    return userMetadata?.value;
  }

  public async fetchAccountMetadata(
    userId: UserId,
  ): Promise<{ hash: string; data: z.infer<TAccountMetadataSchema> } | undefined> {
    const metadataHash = await this.fetchMetadataHashByUserId(userId);

    if (isTest()) {
      const val = JSON.parse(localStorage.getItem(`mock_ipfs_${metadataHash}`) ?? '');
      return val;
    }

    if (!metadataHash) return undefined;

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

    const client = await this.getClient(this._metadataSchema);

    const tx = await this.emitUserMetadata(client, newHash, userId);

    return {
      newHash,
      tx,
    };
  }

  private async emitUserMetadata(
    client: AddressDriverClient | NFTDriverClient | GitDriverClient,
    newHash: string,
    userId: UserId,
  ) {
    const userMetadata = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: newHash,
      },
    ];

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

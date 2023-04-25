import type { z } from 'zod';
import MetadataManagerBase from './MetadataManagerBase';
import { gitDriverSplitReceiverSchema, nftDriverAccountMetadataSchema } from './schemas';
import type { NFTDriverAccount, UserId } from './types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { DripsSubgraphClient } from 'radicle-drips';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataSchema,
  NFTDriverAccount
> {
  constructor();
  constructor(subgraphClient: DripsSubgraphClient);
  constructor(subgraphClient?: DripsSubgraphClient) {
    super(nftDriverAccountMetadataSchema, subgraphClient);
  }

  public async fetchAccount(userId: UserId): Promise<NFTDriverAccount | null> {
    const ownerSubAccount = await this.subgraphClient.getNftSubAccountOwnerByTokenId(userId);

    if (!ownerSubAccount) {
      return null;
    }

    if (ownerSubAccount.tokenId !== userId) {
      throw new Error(
        `The provided user ID ${userId} does not match the expected owner sub-account tokenId ${ownerSubAccount.tokenId} found on-chain.`,
      );
    }

    return {
      driver: 'nft',
      userId: ownerSubAccount.tokenId,
      owner: ownerSubAccount.ownerAddress,
    } as NFTDriverAccount;
  }

  public buildAccountMetadata(context: {
    forAccount: NFTDriverAccount;
    projects: z.infer<typeof gitDriverSplitReceiverSchema>[];
  }): z.infer<typeof nftDriverAccountMetadataSchema> {
    const { forAccount, projects } = context;

    return {
      driver: 'nft',
      describes: {
        driver: forAccount.driver,
        userId: forAccount.userId,
      },
      isDripList: true,
      projects: mapFilterUndefined(projects, (listProj) => ({
        userId: forAccount.userId,
        weight: listProj.weight,
        source: listProj.source,
      })),
    };
  }
}

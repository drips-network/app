import type { z } from 'zod';
import MetadataManagerBase from './MetadataManagerBase';
import { nftDriverAccountMetadataSchema } from './schemas';
import type { NFTDriverAccount, UserId } from './types';
import { getAddressDriverClient } from '../get-drips-clients';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataSchema,
  NFTDriverAccount
> {
  constructor() {
    super(nftDriverAccountMetadataSchema);
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

    const addressDriverClient = await getAddressDriverClient();

    return {
      driver: 'nft',
      userId: ownerSubAccount.tokenId,
      owner: {
        driver: 'address',
        userId: await addressDriverClient.getUserIdByAddress(ownerSubAccount.ownerAddress),
        address: ownerSubAccount.ownerAddress,
      },
    } as NFTDriverAccount;
  }

  public buildAccountMetadata(context: {
    forAccount: NFTDriverAccount;
    name?: string;
  }): z.infer<typeof nftDriverAccountMetadataSchema> {
    const { forAccount, name } = context;

    return {
      driver: 'nft',
      describes: {
        driver: forAccount.driver,
        userId: forAccount.userId,
      },
      isDripList: true,
      name,
    };
  }
}

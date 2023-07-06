import type { z } from 'zod';
import MetadataManagerBase from './MetadataManagerBase';
import { nftDriverAccountMetadataSchema } from './schemas';
import type { NFTDriverAccount, AccountId } from './types';
import { getAddressDriverClient } from '../get-drips-clients';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataSchema,
  NFTDriverAccount
> {
  constructor() {
    super(nftDriverAccountMetadataSchema);
  }

  public async fetchAccount(accountId: AccountId): Promise<NFTDriverAccount | null> {
    const ownerSubAccount = await this.subgraphClient.getNftSubAccountOwnerByTokenId(accountId);

    if (!ownerSubAccount) {
      return null;
    }

    if (ownerSubAccount.tokenId !== accountId) {
      throw new Error(
        `The provided user ID ${accountId} does not match the expected owner sub-account tokenId ${ownerSubAccount.tokenId} found on-chain.`,
      );
    }

    const addressDriverClient = await getAddressDriverClient();

    return {
      driver: 'nft',
      accountId: ownerSubAccount.tokenId,
      owner: {
        driver: 'address',
        accountId: await addressDriverClient.getAccountIdByAddress(ownerSubAccount.ownerAddress),
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
        accountId: forAccount.accountId,
      },
      isDripList: true,
      name,
    };
  }
}

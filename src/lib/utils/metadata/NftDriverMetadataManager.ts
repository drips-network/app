import MetadataManagerBase from './MetadataManagerBase';
import type { NFTDriverAccount, AccountId } from './types';
import { getAddressDriverClient } from '../get-drips-clients';
import { nftDriverAccountMetadataParser } from './schemas';
import type { NFTDriverClient } from 'radicle-drips';
import type { LatestVersion } from './versioned-metadata';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  NFTDriverAccount,
  typeof nftDriverAccountMetadataParser
> {
  constructor(nftDriverClient?: NFTDriverClient) {
    super(nftDriverAccountMetadataParser, nftDriverClient?.emitAccountMetadata);
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
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>['projects'];
    name?: string;
  }): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const { forAccount, projects, name } = context;

    return {
      driver: 'nft',
      describes: {
        driver: forAccount.driver,
        accountId: forAccount.accountId,
      },
      isDripList: true,
      projects,
      name,
    };
  }
}

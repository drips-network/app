import MetadataManagerFactory from '$lib/metadata/MetadataManagerFactory';
import type NftDriverMetadataManager from '$lib/metadata/NftDriverMetadataManager';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import type { DripsSubgraphClient } from 'radicle-drips';

type DripsListTokenId = string;

export default class DripListQueries {
  private readonly _dripsSubgraphClient: DripsSubgraphClient;
  private readonly _nftMetadataManager: NftDriverMetadataManager;

  constructor();
  constructor(
    dripsSubgraphClient?: DripsSubgraphClient,
    nftDriverMetadataManager?: NftDriverMetadataManager,
  );
  constructor(
    dripsSubgraphClient?: DripsSubgraphClient,
    nftDriverMetadataManager?: NftDriverMetadataManager,
  ) {
    this._dripsSubgraphClient = dripsSubgraphClient ?? getSubgraphClient();
    this._nftMetadataManager =
      nftDriverMetadataManager ?? MetadataManagerFactory.getNftDriverMetadataManager();
  }

  public async getDripListsByOwner(ownerAddress: string): Promise<DripsListTokenId[]> {
    const ownerSubAccounts = await this._dripsSubgraphClient.getNftSubAccountsByOwner(ownerAddress);

    if (ownerSubAccounts?.length === 0) {
      return [];
    }

    const dripListIds: DripsListTokenId[] = [];

    ownerSubAccounts.forEach(async (subAccount) => {
      const metadata = await this._nftMetadataManager.fetchAccountMetadata(subAccount.tokenId);

      if (metadata?.data.isDripList) {
        dripListIds.push(subAccount.tokenId);
      }

      // TODO: remove this check after MVP.
      if (dripListIds.length === 2) {
        throw new Error(`More than one drip list found for the owner ${ownerAddress}.`);
      }
    });

    return dripListIds;
  }
}

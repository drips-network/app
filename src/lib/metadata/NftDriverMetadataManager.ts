import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import { nftDriverAccountMetadataSchema } from './schemas';
import type { NFTDriverAccount, UserId } from './types';

export interface INftDriverMetadataManager
  extends IMetadataManager<typeof nftDriverAccountMetadataSchema> {
  fetchAccount(userId: UserId): Promise<NFTDriverAccount>;
}

export default class NftDriverMetadataManager
  extends MetadataManagerBase<typeof nftDriverAccountMetadataSchema>
  implements INftDriverMetadataManager
{
  constructor() {
    super(nftDriverAccountMetadataSchema);
  }

  fetchAccount(userId: UserId): Promise<NFTDriverAccount> {
    throw new Error('Method not implemented.');
  }
}

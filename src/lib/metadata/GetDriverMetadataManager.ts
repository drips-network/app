import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import { gitDriverAccountMetadataSchema } from './schemas';
import type { GitDriverAccount, UserId } from './types';

export interface IGitDriverMetadataManager
  extends IMetadataManager<typeof gitDriverAccountMetadataSchema> {
  fetchAccount(userId: UserId): Promise<GitDriverAccount>;
}

export default class GitDriverMetadataManager
  extends MetadataManagerBase<typeof gitDriverAccountMetadataSchema>
  implements IGitDriverMetadataManager
{
  constructor() {
    super(gitDriverAccountMetadataSchema);
  }

  fetchAccount(userId: UserId): Promise<GitDriverAccount> {
    throw new Error('Method not implemented.');
  }
}

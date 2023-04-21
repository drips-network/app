import type { GitDriverClient } from 'radicle-drips';
import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import { gitDriverAccountMetadataSchema } from './schemas';
import type { GitDriverAccount, UserId } from './types';
import { getGitDriverClient } from '$lib/utils/get-drips-clients';

export interface IGitDriverMetadataManager
  extends IMetadataManager<typeof gitDriverAccountMetadataSchema> {
  fetchAccount(userId: UserId): Promise<GitDriverAccount>;

  /**
   * Verifies the source metadata of a project.
   *
   * @param projectId - The ID of the project to verify the source metadata for.
   * @returns A Promise that resolves to a boolean indicating whether the source metadata is valid.
   */
  verifySourceMetadata(gitUrl: string): Promise<boolean>;
}

export default class GitDriverMetadataManager
  extends MetadataManagerBase<typeof gitDriverAccountMetadataSchema>
  implements IGitDriverMetadataManager
{
  private _gitDriverClient: GitDriverClient;

  constructor(gitDriverClient?: GitDriverClient);
  constructor(gitDriverClient: GitDriverClient) {
    gitDriverClient = gitDriverClient ?? getGitDriverClient();

    super(gitDriverAccountMetadataSchema);

    this._gitDriverClient = gitDriverClient;
  }

  public async verifySourceMetadata(projectId: string): Promise<boolean> {
    const metadata = await super.fetchAccountMetadata(projectId);

    if (!metadata?.data.source) {
      return false;
    }

    const { url, repoName } = metadata.data.source;

    const onChainProjectId = await this._gitDriverClient.getProjectId(url);

    if (onChainProjectId !== projectId) {
      return false;
    }

    if (!url.includes(repoName)) {
      return false;
    }

    return true;
  }

  fetchAccount(userId: UserId): Promise<GitDriverAccount> {
    throw new Error('Method not implemented.');
  }
}

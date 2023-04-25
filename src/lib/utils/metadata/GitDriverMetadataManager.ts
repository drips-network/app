import type { GitDriverClient } from 'radicle-drips';
import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import {
  addressDriverSplitReceiverSchema,
  gitDriverAccountMetadataSchema,
  gitDriverSplitReceiverSchema,
  splitReceiverSchema,
} from './schemas';
import type { ClaimedGitProject, GitDriverAccount, UserId } from './types';
import { getGitDriverClient } from '$lib/utils/get-drips-clients';
import type { z } from 'zod';

export interface IGitDriverMetadataManager
  extends IMetadataManager<typeof gitDriverAccountMetadataSchema, GitDriverAccount> {
  /**
   * Verifies the source metadata of a project.
   *
   * @param projectId - The ID of the project to verify the source metadata for.
   * @returns A Promise that resolves to a boolean indicating whether the source metadata is valid.
   */
  verifySourceMetadata(gitUrl: string): Promise<boolean>;
}

export default class GitDriverMetadataManager extends MetadataManagerBase<
  typeof gitDriverAccountMetadataSchema,
  GitDriverAccount
> {
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

  async fetchAccount(userId: UserId): Promise<GitDriverAccount | null> {
    const metadata = await super.fetchAccountMetadata(userId);

    if (!metadata) {
      return null;
    }

    const { data } = metadata;

    return {
      userId: data.describes.userId,
      driver: data.describes.driver,
    } as GitDriverAccount;
  }

  public buildAccountMetadata(context: {
    forProject: ClaimedGitProject;
    forSplits: {
      maintainers: z.infer<typeof addressDriverSplitReceiverSchema>[];
      dependencies: z.infer<typeof gitDriverSplitReceiverSchema>[];
      dripsDonation?: z.infer<typeof splitReceiverSchema>;
    };
  }): z.infer<typeof gitDriverAccountMetadataSchema> {
    const { forProject, forSplits } = context;

    return {
      driver: 'git',
      describes: {
        driver: 'git',
        userId: forProject.gitDriverAccount.userId,
      },
      source: forProject.source,
      emoji: forProject.emoji,
      color: forProject.color,
      description: forProject.description,
      splits: forSplits,
    };
  }
}

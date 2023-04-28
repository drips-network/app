import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import {
  addressDriverSplitReceiverSchema,
  repoDriverAccountMetadataSchema,
  repoDriverSplitReceiverSchema,
  splitReceiverSchema,
} from './schemas';
import type { ClaimedGitProject, RepoDriverAccount, UserId } from './types';
import { getRepoDriverClient } from '$lib/utils/get-drips-clients';
import type { z } from 'zod';
import { Forge } from 'radicle-drips';

export interface IRepoDriverMetadataManager
  extends IMetadataManager<typeof repoDriverAccountMetadataSchema, RepoDriverAccount> {
  /**
   * Verifies the source metadata of a project.
   *
   * @param repoId - The ID of the user to verify the source metadata for.
   * @returns A Promise that resolves to a boolean indicating whether the source metadata is valid.
   */
  verifySourceMetadata(userId: string): Promise<boolean>;
}

export default class RepoDriverMetadataManager extends MetadataManagerBase<
  typeof repoDriverAccountMetadataSchema,
  RepoDriverAccount
> {
  constructor() {
    super(repoDriverAccountMetadataSchema);
  }

  public async verifySourceMetadata(userId: string): Promise<boolean> {
    const metadata = await super.fetchAccountMetadata(userId);

    if (!metadata?.data.source) {
      return false;
    }

    const { url, repoName, forge: forgeAsString } = metadata.data.source;

    const forge: Forge = RepoDriverMetadataManager.forgeFromString(forgeAsString);

    const repoDriverClient = await getRepoDriverClient();

    const repoId = await repoDriverClient.getRepoId(forge, repoName);

    const onChainUserId = await repoDriverClient.getUserId(repoId);

    if (onChainUserId !== userId) {
      return false;
    }

    if (!url.includes(repoName)) {
      return false;
    }

    return true;
  }

  public static forgeFromString(forgeAsString: string) {
    let forge: Forge;
    if (forgeAsString === 'github') {
      forge = Forge.GitHub;
    } else if (forgeAsString === 'gitlab') {
      forge = Forge.GitLab;
    } else if (forgeAsString === 'radicle') {
      throw new Error('Radicle forges are not supported yet.');
    } else {
      throw new Error(`Unknown forge type: ${forgeAsString}`);
    }

    return forge;
  }

  async fetchAccount(userId: UserId): Promise<RepoDriverAccount | null> {
    const metadata = await super.fetchAccountMetadata(userId);

    if (!metadata) {
      return null;
    }

    const { data } = metadata;

    return {
      userId: data.describes.userId,
      driver: data.describes.driver,
    } as RepoDriverAccount;
  }

  public buildAccountMetadata(context: {
    forProject: ClaimedGitProject;
    forSplits: {
      maintainers: z.infer<typeof addressDriverSplitReceiverSchema>[];
      dependencies: z.infer<typeof repoDriverSplitReceiverSchema>[];
      dripsDonation?: z.infer<typeof splitReceiverSchema>;
    };
  }): z.infer<typeof repoDriverAccountMetadataSchema> {
    const { forProject, forSplits } = context;

    return {
      driver: 'repo',
      describes: {
        driver: 'repo',
        userId: forProject.repoDriverAccount.userId,
      },
      source: forProject.source,
      emoji: forProject.emoji,
      color: forProject.color,
      description: forProject.description,
      splits: forSplits,
    };
  }
}

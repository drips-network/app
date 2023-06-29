import RepoDriverUtils from '../RepoDriverUtils';
import { getRepoDriverClient } from '../get-drips-clients';
import MetadataManagerBase from './MetadataManagerBase';
import {
  addressDriverSplitReceiverSchema,
  repoDriverAccountMetadataSchema,
  repoDriverSplitReceiverSchema,
  splitReceiverSchema,
} from './schemas';
import type { ClaimedGitProject, GitHubSource, RepoDriverAccount, UserId } from './types';

import type { z } from 'zod';

export default class RepoDriverMetadataManager extends MetadataManagerBase<
  typeof repoDriverAccountMetadataSchema,
  RepoDriverAccount
> {
  constructor() {
    super(repoDriverAccountMetadataSchema);
  }

  /**
   * Fetches (and verifies) the latest IPFS metadata for a given user ID.
   * @param userId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or null if no metadata exists.
   * @throws If the metadata is invalid.
   */
  public override async fetchAccountMetadata(
    userId: UserId,
  ): Promise<{ hash: string; data: z.infer<typeof repoDriverAccountMetadataSchema> } | null> {
    const metadata = await super.fetchAccountMetadata(userId);

    if (!metadata) {
      return null;
    }

    const { url, repoName, forge } = metadata.data.source;

    // TODO: This would only work for GitHub. Update this when we add support other forges.
    const username = (metadata.data.source as GitHubSource).ownerName;

    const repoDriverClient = await getRepoDriverClient();
    const onChainUserId = await repoDriverClient.getUserId(
      RepoDriverUtils.forgeFromString(forge),
      `${username}/${repoName}`,
    );

    if (onChainUserId !== userId) {
      throw new Error(
        `The user ID ${userId} does not match the on-chain user ID ${onChainUserId} for the repo ${repoName} on ${forge}.`,
      );
    }

    if (!url.includes(repoName)) {
      throw new Error(
        `The repo name ${repoName} is not included in the URL ${url} for the repo ${repoName} on ${forge}.`,
      );
    }

    return metadata;
  }

  public async fetchAccount(userId: UserId): Promise<RepoDriverAccount | null> {
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
      dependencies: (
        | z.infer<typeof addressDriverSplitReceiverSchema>
        | z.infer<typeof repoDriverSplitReceiverSchema>
      )[];
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

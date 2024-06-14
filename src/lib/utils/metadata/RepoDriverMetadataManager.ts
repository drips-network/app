import type { ClaimedProject } from '$lib/graphql/__generated__/base-types';
import query from '$lib/graphql/dripsQL';
import type { PickGQLF } from '$lib/graphql/utils/pick-gql-fields';
import { gql } from 'graphql-request';
import RepoDriverUtils from '../RepoDriverUtils';
import { getRepoDriverClient } from '../get-drips-clients';
import MetadataManagerBase from './MetadataManagerBase';
import { repoDriverAccountMetadataParser } from './schemas';
import type { AnyVersion, LatestVersion } from '@efstajas/versioned-parser/lib/types';
import type {
  LatestProjectMetadataHashQuery,
  LatestProjectMetadataHashQueryVariables,
} from './__generated__/gql.generated';

type AccountId = string;

export default class RepoDriverMetadataManager extends MetadataManagerBase<
  typeof repoDriverAccountMetadataParser
> {
  constructor() {
    super(repoDriverAccountMetadataParser);
  }

  public async fetchMetadataHashByAccountId(accountId: string): Promise<string | null> {
    const res = await query<
      LatestProjectMetadataHashQuery,
      LatestProjectMetadataHashQueryVariables
    >(
      gql`
        query LatestProjectMetadataHash($accountId: ID!) {
          projectById(id: $accountId) {
            ... on ClaimedProject {
              latestMetadataIpfsHash
            }
          }
        }
      `,
      { accountId },
    );

    if (res.projectById?.__typename === 'ClaimedProject') {
      return res.projectById.latestMetadataIpfsHash;
    }

    return null;
  }

  /**
   * Fetches (and verifies) the latest IPFS metadata for a given user ID.
   * @param accountId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or null if no metadata exists.
   * @throws If the metadata is invalid.
   */
  public override async fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: string; data: AnyVersion<typeof repoDriverAccountMetadataParser> } | null> {
    const metadata = await super.fetchAccountMetadata(accountId);

    if (!metadata) {
      return null;
    }

    const { url, repoName, ownerName, forge } = metadata.data.source;

    const repoDriverClient = await getRepoDriverClient();
    const onChainAccountId = await repoDriverClient.getAccountId(
      RepoDriverUtils.forgeFromString(forge),
      `${ownerName}/${repoName}`, // TODO: This would only work for GitHub. Update this when we add support other forges.
    );

    if (onChainAccountId !== accountId) {
      throw new Error(
        `The user ID ${accountId} does not match the on-chain user ID ${onChainAccountId} for the repo ${repoName} on ${forge}.`,
      );
    }

    if (!url.includes(repoName)) {
      throw new Error(
        `The repo name ${repoName} is not included in the URL ${url} for the repo ${repoName} on ${forge}.`,
      );
    }

    return metadata;
  }

  public buildAccountMetadata(context: {
    forProject: PickGQLF<ClaimedProject, 'account' | 'source' | 'avatar' | 'color' | 'description'>;
    forSplits: LatestVersion<typeof repoDriverAccountMetadataParser>['splits'];
  }): LatestVersion<typeof repoDriverAccountMetadataParser> {
    const { forProject, forSplits } = context;

    return {
      driver: 'repo',
      describes: {
        driver: 'repo',
        accountId: forProject.account.accountId,
      },
      source: {
        forge: 'github',
        repoName: forProject.source.repoName,
        ownerName: forProject.source.ownerName,
        url: forProject.source.url,
      },
      avatar:
        forProject.avatar.__typename === 'EmojiAvatar'
          ? {
              type: 'emoji',
              emoji: forProject.avatar.emoji,
            }
          : {
              type: 'image',
              cid: forProject.avatar.cid,
            },
      color: forProject.color,
      description: forProject.description ?? undefined,
      splits: forSplits,
    };
  }

  public upgradeAccountMetadata(
    currentMetadata: AnyVersion<typeof repoDriverAccountMetadataParser>,
  ): LatestVersion<typeof repoDriverAccountMetadataParser> {
    const result = currentMetadata;

    type AnyVersionSplits = AnyVersion<typeof repoDriverAccountMetadataParser>['splits'];

    const upgradeSplit = (
      split: AnyVersionSplits['dependencies'][number] | AnyVersionSplits['maintainers'][number],
    ) => {
      if ('type' in split) return split;

      const type = 'source' in split ? ('repoDriver' as const) : ('address' as const);

      if (type === 'address') {
        return {
          type,
          weight: split.weight,
          accountId: split.accountId,
        };
      } else {
        if (!('source' in split)) throw new Error('Invalid split');

        return {
          type,
          weight: split.weight,
          accountId: split.accountId,
          source: split.source,
        };
      }
    };

    result.splits.dependencies = result.splits.dependencies.map(upgradeSplit);
    result.splits.maintainers = result.splits.maintainers.map(upgradeSplit);

    const newRes = result as LatestVersion<typeof repoDriverAccountMetadataParser>;

    // Upgrade emoji

    if (result.emoji) {
      newRes.avatar = {
        type: 'emoji',
        emoji: result.emoji,
      };

      delete newRes.emoji;
    }

    const parsed = repoDriverAccountMetadataParser.parseLatest(result);

    return parsed;
  }
}

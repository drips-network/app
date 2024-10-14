import query from '$lib/graphql/dripsQL';
import type { PickGQLF } from '$lib/graphql/utils/pick-gql-fields';
import { gql } from 'graphql-request';
import MetadataManagerBase from './MetadataManagerBase';
import { repoDriverAccountMetadataParser } from './schemas';
import type { AnyVersion, LatestVersion } from '@efstajas/versioned-parser';
import type {
  LatestProjectMetadataHashQuery,
  LatestProjectMetadataHashQueryVariables,
} from './__generated__/gql.generated';
import { Forge, type OxString } from '../sdk/sdk-types';
import { hexlify, toUtf8Bytes } from 'ethers';
import { executeRepoDriverReadMethod } from '../sdk/repo-driver/repo-driver';
import filterCurrentChainData from '../filter-current-chain-data';
import type { ClaimedProjectData, Project } from '$lib/graphql/__generated__/base-types';
import network from '$lib/stores/wallet/network';

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
        query LatestProjectMetadataHash($accountId: ID!, $chains: [SupportedChain!]) {
          projectById(id: $accountId, chains: $chains) {
            chainData {
              ... on ClaimedProjectData {
                __typename
                chain
                latestMetadataIpfsHash
              }
              ... on UnClaimedProjectData {
                __typename
                chain
              }
            }
          }
        }
      `,
      { accountId, chains: [network.gqlName] },
    );

    if (!res.projectById) {
      return null;
    }

    const projectChainData = filterCurrentChainData(res.projectById.chainData);

    if (projectChainData.__typename === 'ClaimedProjectData') {
      return projectChainData.latestMetadataIpfsHash;
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

    const onChainAccountId = await executeRepoDriverReadMethod({
      functionName: 'calcAccountId',
      args: [Forge.gitHub, hexlify(toUtf8Bytes(`${ownerName}/${repoName}`)) as OxString], // TODO: Change hard-coded Forge logic to dynamic when other forges are supported.
    });

    if (onChainAccountId.toString() !== accountId) {
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
    forProject: PickGQLF<Project, 'account' | 'source'> & {
      chainData: Pick<ClaimedProjectData, 'avatar' | 'color' | 'description'>;
    };
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
        forProject.chainData.avatar.__typename === 'EmojiAvatar'
          ? {
              type: 'emoji',
              emoji: forProject.chainData.avatar.emoji,
            }
          : {
              type: 'image',
              cid: forProject.chainData.avatar.cid,
            },
      color: forProject.chainData.color,
      description: forProject.chainData.description ?? undefined,
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

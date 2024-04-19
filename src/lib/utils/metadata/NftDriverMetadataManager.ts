import MetadataManagerBase from './MetadataManagerBase';
import { nftDriverAccountMetadataParser } from './schemas';
import type { NFTDriverClient } from 'radicle-drips';
import type { AnyVersion, LatestVersion } from '@efstajas/versioned-parser/lib/types';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataParser
> {
  constructor(nftDriverClient?: NFTDriverClient) {
    super(nftDriverAccountMetadataParser, nftDriverClient?.emitAccountMetadata);
  }

  public buildAccountMetadata(context: {
    forAccountId: string;
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>['projects'];
    name?: string;
    description?: string;
    latestVotingRoundId?: string;
  }): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const { forAccountId, projects, name, description, latestVotingRoundId } = context;

    return {
      driver: 'nft',
      describes: {
        driver: 'nft',
        accountId: forAccountId,
      },
      isDripList: true,
      projects,
      name,
      description,
      latestVotingRoundId,
    };
  }

  public upgradeAccountMetadata(
    currentMetadata: AnyVersion<typeof nftDriverAccountMetadataParser>,
  ): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const result = currentMetadata;

    type Projects = AnyVersion<typeof nftDriverAccountMetadataParser>['projects'][number];

    const upgradeSplit = (split: Projects) => {
      if ('type' in split) return split;

      if ('source' in split) {
        return {
          type: 'repoDriver' as const,
          ...split,
        };
      } else {
        return {
          type: 'address' as const,
          ...split,
        };
      }
    };

    result.projects = result.projects.map(upgradeSplit);

    const parsed = nftDriverAccountMetadataParser.parseLatest(result);

    return parsed;
  }
}

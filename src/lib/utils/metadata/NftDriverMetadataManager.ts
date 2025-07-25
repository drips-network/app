import MetadataManagerBase from './MetadataManagerBase';
import { nftDriverAccountMetadataParser } from './schemas';
import type { AnyVersion, LatestVersion } from '@efstajas/versioned-parser';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type {
  LatestDripListMetadataHashQuery,
  LatestDripListMetadataHashQueryVariables,
} from './__generated__/gql.generated';
import type { executeNftDriverWriteMethod } from '../sdk/nft-driver/nft-driver';
import network from '$lib/stores/wallet/network';
import type { AccountId } from '../common-types';

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataParser
> {
  constructor(nftDriver?: typeof executeNftDriverWriteMethod) {
    super(nftDriverAccountMetadataParser, nftDriver);
  }

  /**
   * Fetches NFTDriver metadata but ensures that Ecosystem metadata is not fetched. We
   * shouldn't be handling it at this point.
   *
   * @param accountId The user ID to fetch the metadata for.
   * @returns The latest IPFS metadata for the given user ID, or null if no metadata exists.
   * @throws If the metadata is invalid.
   */
  public override async fetchAccountMetadata(
    accountId: AccountId,
  ): Promise<{ hash: string; data: AnyVersion<typeof nftDriverAccountMetadataParser> } | null> {
    const metadata = await super.fetchAccountMetadata(accountId);

    if (!metadata) {
      return null;
    }

    if ('type' in metadata.data && metadata.data.type !== 'dripList') {
      throw new Error(`Expected metadata type to be 'dripList', but got '${metadata.data.type}'.`);
    }

    return metadata;
  }

  public async fetchMetadataHashByAccountId(accountId: string): Promise<string | null> {
    const res = await query<
      LatestDripListMetadataHashQuery,
      LatestDripListMetadataHashQueryVariables
    >(
      gql`
        query LatestDripListMetadataHash($accountId: ID!, $chain: SupportedChain!) {
          dripList(id: $accountId, chain: $chain) {
            latestMetadataIpfsHash
          }
        }
      `,
      { accountId, chain: network.gqlName },
    );

    return res.dripList?.latestMetadataIpfsHash ?? null;
  }

  public buildAccountMetadata(context: {
    forAccountId: string;
    recipients: Extract<
      LatestVersion<typeof nftDriverAccountMetadataParser>,
      { type: 'dripList' }
    >['recipients'];
    isVisible: boolean;
    name?: string;
    description?: string;
    latestVotingRoundId?: string;
  }): Extract<LatestVersion<typeof nftDriverAccountMetadataParser>, { type: 'dripList' }> {
    const { forAccountId, recipients, name, description, latestVotingRoundId, isVisible } = context;

    return {
      type: 'dripList',
      driver: 'nft',
      describes: {
        driver: 'nft',
        accountId: forAccountId,
      },
      recipients,
      name,
      description,
      latestVotingRoundId,
      isVisible,
    };
  }

  public upgradeAccountMetadata(
    currentMetadata: AnyVersion<typeof nftDriverAccountMetadataParser>,
  ): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const result = {
      ...currentMetadata,
    } as Record<string, unknown>;

    if ('projects' in result && Array.isArray(result.projects)) {
      const upgradeSplit = (
        split: Record<string, unknown> & {
          source?: unknown;
        },
      ) => {
        if ('type' in split) return split;

        if ('source' in split) {
          return {
            type: 'repoDriver' as const,
            ...split,
          };
        }
        return {
          type: 'address' as const,
          ...split,
        };
      };

      result.recipients = result.projects.map(upgradeSplit);
      delete result.projects;
    }

    if (!('type' in result)) {
      result.type = 'dripList';
    }

    if ('isDripList' in result) {
      delete result.isDripList;
    }

    const newRes = result as LatestVersion<typeof nftDriverAccountMetadataParser>;

    newRes.isVisible =
      'isVisible' in result && typeof result.isVisible === 'boolean' ? result.isVisible : true;

    const parsed = nftDriverAccountMetadataParser.parseLatest(newRes);

    return parsed;
  }
}

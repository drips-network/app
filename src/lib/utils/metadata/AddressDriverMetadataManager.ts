import { AddressDriverClient } from 'radicle-drips';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import MetadataManagerBase from './MetadataManagerBase';
import { addressDriverAccountMetadataParser } from './schemas';
import type { Account } from '$lib/stores/streams/types';
import type { AccountId } from './types';
import { reconcileStreamsSetReceivers } from '$lib/stores/streams/methods/reconcile-drips-set-receivers';
import seperateStreamsSetEvents from '$lib/stores/streams/methods/separate-drips-set-events';
import buildAssetConfigs from '$lib/stores/streams/methods/build-asset-configs';
import type { AnyVersion, LatestVersion } from '@efstajas/versioned-parser/lib/types';

export default class AddressDriverMetadataManager extends MetadataManagerBase<
  Account,
  typeof addressDriverAccountMetadataParser
> {
  constructor() {
    super(addressDriverAccountMetadataParser);
  }

  public async fetchAccount(accountId: AccountId): Promise<Account> {
    const { data, hash } = (await this.fetchAccountMetadata(accountId)) ?? {};

    const streamsSetEvents = await this.subgraphClient.getStreamsSetEventsByAccountId(accountId);

    const streamsSetEventsWithFullReceivers = reconcileStreamsSetReceivers(streamsSetEvents);

    const streamsSetEventsByTokenAddress = seperateStreamsSetEvents(
      streamsSetEventsWithFullReceivers,
    );

    const assetConfigs = buildAssetConfigs(accountId, data, streamsSetEventsByTokenAddress);

    return {
      user: {
        accountId,
        driver: 'address',
        address: AddressDriverClient.getUserAddress(accountId),
      },
      name: data?.name,
      description: data?.description,
      emoji: data?.emoji,
      assetConfigs: assetConfigs ?? [],
      lastUpdated: data ? new Date(data.timestamp * 1000) : undefined,
      lastUpdatedByAddress: data?.writtenByAddress,
      lastIpfsHash: hash,
      visibleDripListAccountIds:
        data && 'visibleDripListAccountIds' in data ? data.visibleDripListAccountIds : undefined,
    };
  }

  public buildAccountMetadata(context: {
    forAccount: Account;
    address: string;
  }): ReturnType<typeof addressDriverAccountMetadataParser.parseLatest> {
    const { forAccount, address } = context;

    return {
      describes: forAccount.user,
      name: forAccount.name,
      description: forAccount.description,
      emoji: forAccount.emoji,
      timestamp: Math.floor(new Date().getTime() / 1000),
      writtenByAddress: address,
      visibleDripListAccountIds: forAccount.visibleDripListAccountIds ?? [],
      assetConfigs: mapFilterUndefined(forAccount.assetConfigs, (assetConfig) => ({
        tokenAddress: assetConfig.tokenAddress,
        streams: mapFilterUndefined(assetConfig.streams, (stream) => {
          if (stream.managed === false) return undefined;

          return {
            id: stream.id,
            initialDripsConfig: {
              dripId: stream.streamConfig.dripId,
              raw: stream.streamConfig.raw.toString(),
              startTimestamp: Math.floor((stream.streamConfig.startDate?.getTime() || 0) / 1000),
              durationSeconds: stream.streamConfig.durationSeconds || 0,
              amountPerSecond: stream.streamConfig.amountPerSecond.amount,
            },
            receiver: stream.receiver,
            archived: stream.archived ?? false,
            name: stream.name,
            description: stream.description,
          };
        }),
      })),
    };
  }

  public upgradeAccountMetadata(
    currentMetadata: AnyVersion<typeof addressDriverAccountMetadataParser>,
  ): LatestVersion<typeof addressDriverAccountMetadataParser> {
    return currentMetadata;
  }
}

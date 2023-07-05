import { AddressDriverClient } from 'radicle-drips';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { z } from 'zod';
import MetadataManagerBase from './MetadataManagerBase';
import { addressDriverAccountMetadataSchema } from './schemas';
import type { Account } from '$lib/stores/streams/types';
import type { UserId } from './types';
import { reconcileStreamsSetReceivers } from '$lib/stores/streams/methods/reconcile-drips-set-receivers';
import seperateStreamsSetEvents from '$lib/stores/streams/methods/separate-drips-set-events';
import buildAssetConfigs from '$lib/stores/streams/methods/build-asset-configs';

export default class AddressDriverMetadataManager extends MetadataManagerBase<
  typeof addressDriverAccountMetadataSchema,
  Account
> {
  constructor() {
    super(addressDriverAccountMetadataSchema);
  }

  public async fetchAccount(userId: UserId): Promise<Account> {
    const { data, hash } = (await this.fetchAccountMetadata(userId)) ?? {};

    const streamsSetEvents = await this.subgraphClient.getStreamsSetEventsByUserId(userId);

    const streamsSetEventsWithFullReceivers = reconcileStreamsSetReceivers(streamsSetEvents);

    const streamsSetEventsByTokenAddress = seperateStreamsSetEvents(
      streamsSetEventsWithFullReceivers,
    );

    const assetConfigs = buildAssetConfigs(
      userId,
      data as z.infer<typeof addressDriverAccountMetadataSchema>,
      streamsSetEventsByTokenAddress,
    );

    return {
      user: {
        userId,
        driver: 'address',
        address: AddressDriverClient.getUserAddress(userId),
      },
      name: data?.name,
      description: data?.description,
      emoji: data?.emoji,
      assetConfigs: assetConfigs ?? [],
      lastUpdated: data ? new Date(data.timestamp * 1000) : undefined,
      lastUpdatedByAddress: data?.writtenByAddress,
      lastIpfsHash: hash,
    } as Account;
  }

  public buildAccountMetadata(context: {
    forAccount: Account;
    address: string;
  }): z.infer<typeof addressDriverAccountMetadataSchema> {
    const { forAccount, address } = context;

    return {
      describes: forAccount.user,
      name: forAccount.name,
      description: forAccount.description,
      emoji: forAccount.emoji,
      timestamp: Math.floor(new Date().getTime() / 1000),
      writtenByAddress: address,
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
}

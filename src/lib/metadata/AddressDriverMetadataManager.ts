import type { Account, UserId } from '../stores/streams/types';
import { reconcileDripsSetReceivers } from '../stores/streams/methods/reconcile-drips-set-receivers';
import seperateDripsSetEvents from '../stores/streams/methods/separate-drips-set-events';
import buildAssetConfigs from '../stores/streams/methods/build-asset-configs';
import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { z } from 'zod';
import MetadataManagerBase, { type IMetadataManager } from './MetadataManagerBase';
import { addressDriverAccountMetadataSchema } from './schemas';

export interface IAddressDriverMetadataManager
  extends IMetadataManager<typeof addressDriverAccountMetadataSchema> {
  fetchAccount(userId: UserId): Promise<Account>;
  generateAccountMetadata(
    forAccount: Account,
    address: string,
  ): z.infer<typeof addressDriverAccountMetadataSchema>;
}

export default class AddressDriverMetadataManager
  extends MetadataManagerBase<typeof addressDriverAccountMetadataSchema>
  implements IAddressDriverMetadataManager
{
  constructor();
  constructor(subgraphClient: DripsSubgraphClient);
  constructor(subgraphClient?: DripsSubgraphClient) {
    super(addressDriverAccountMetadataSchema, subgraphClient);
  }

  public async fetchAccount(userId: UserId): Promise<Account> {
    const { data, hash } = (await this.fetchAccountMetadata(userId)) ?? {};

    const dripsSetEvents = await this.subgraphClient.getDripsSetEventsByUserId(userId);

    const dripsSetEventsWithFullReceivers = reconcileDripsSetReceivers(dripsSetEvents);

    const dripsSetEventsByTokenAddress = seperateDripsSetEvents(dripsSetEventsWithFullReceivers);

    const assetConfigs = buildAssetConfigs(userId, data, dripsSetEventsByTokenAddress);

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
    };
  }

  public generateAccountMetadata(
    forAccount: Account,
    address: string,
  ): z.infer<typeof addressDriverAccountMetadataSchema> {
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
              dripId: stream.dripsConfig.dripId,
              raw: stream.dripsConfig.raw.toString(),
              startTimestamp: Math.floor((stream.dripsConfig.startDate?.getTime() || 0) / 1000),
              durationSeconds: stream.dripsConfig.durationSeconds || 0,
              amountPerSecond: stream.dripsConfig.amountPerSecond.amount,
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

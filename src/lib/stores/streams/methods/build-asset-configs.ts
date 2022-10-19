import { AddressDriverClient, Utils, type DripsSubgraphTypes } from 'radicle-drips';
import type { z } from 'zod';
import type { accountMetadataSchema } from '../metadata';
import type { AssetConfig, AssetConfigHistoryItem, DripsConfig } from '../types';
import makeStreamId from './make-stream-id';
import assert from '$lib/utils/assert';
import matchMetadataStreamToReceiver from './match-metadata-stream-to-receiver';

/**
 * Given accountMetadata and on-chain dripsSetEvents, construct an object describing
 * the account, including the full history of all its assetConfigs, with on-chain receivers
 * matched onto IPFS stream metadata.
 * @param accountMetadata The metadata for the given account fetched from IPFS.
 * @param dripsSetEvents The on-chain history of dripsSetEvents for the given account.
 * @returns The constructed Account object.
 * @throw An error if an assetConfig exists in metadata that no dripsSet events exist for.
 * @throw An error if any of the receivers existing onChain match multiple streams described
 * in metadata.
 */
export default function buildAssetConfigs(
  accountMetadata: z.infer<typeof accountMetadataSchema>,
  dripsSetEvents: { [tokenAddress: string]: DripsSubgraphTypes.DripsSetEvent[] },
) {
  return accountMetadata.assetConfigs.reduce<AssetConfig[]>((acc, assetConfigMetadata) => {
    const { tokenAddress } = assetConfigMetadata;
    const assetConfigDripsSetEvents = dripsSetEvents[tokenAddress];

    assert(
      assetConfigDripsSetEvents && assetConfigDripsSetEvents.length > 0,
      `Unable to find dripsSet events for asset config with token address ${tokenAddress}`,
    );

    const assetConfigHistoryItems: AssetConfigHistoryItem[] = [];

    for (const dripsSetEvent of assetConfigDripsSetEvents) {
      const assetConfigHistoryItemStreams: {
        streamId: string;
        dripsConfig?: DripsConfig;
        managed: boolean;
      }[] = [];

      const remainingStreamIds = assetConfigMetadata.streams.map((stream) =>
        makeStreamId(
          accountMetadata.describes.userId,
          tokenAddress,
          stream.initialDripsConfig.dripId,
        ),
      );

      for (const dripsReceiverSeenEvent of dripsSetEvent.dripsReceiverSeenEvents) {
        const matchingStream = matchMetadataStreamToReceiver(
          dripsReceiverSeenEvent,
          assetConfigMetadata.streams,
        );

        const eventConfig = Utils.DripsReceiverConfiguration.fromUint256(
          dripsReceiverSeenEvent.config,
        );

        const streamId = makeStreamId(
          accountMetadata.describes.userId,
          tokenAddress,
          eventConfig.dripId.toString(),
        );

        assetConfigHistoryItemStreams.push({
          streamId,
          dripsConfig: {
            raw: dripsReceiverSeenEvent.config,
            startDate:
              eventConfig.start > 0n ? new Date(Number(eventConfig.start) * 1000) : undefined,
            amountPerSecond: {
              amount: eventConfig.amountPerSec,
              tokenAddress: tokenAddress,
            },
            dripId: eventConfig.dripId.toString(),
            durationSeconds: eventConfig.duration > 0n ? Number(eventConfig.duration) : undefined,
          },
          managed: Boolean(matchingStream),
        });

        remainingStreamIds.splice(remainingStreamIds.indexOf(streamId), 1);
      }

      /*
      If a particular stream doesn't appear within dripsReceiverSeenEvents of a given
      dripsSet event, we can assume it is paused.
      */
      for (const remainingStreamId of remainingStreamIds) {
        assetConfigHistoryItemStreams.push({
          streamId: remainingStreamId,
          // Undefined dripsConfig == stream was paused
          dripsConfig: undefined,
          managed: true,
        });
      }

      let runsOutOfFunds: Date | undefined;

      // If maxEnd is the largest possible timestamp, all current streams end before balance is depleted.
      if (dripsSetEvent.maxEnd === 2n ** 32n - 1n) {
        runsOutOfFunds = undefined;
      } else if (dripsSetEvent.maxEnd === 0n) {
        runsOutOfFunds = undefined;
      } else {
        runsOutOfFunds = new Date(Number(dripsSetEvent.maxEnd) * 1000);
      }

      assetConfigHistoryItems.push({
        timestamp: new Date(Number(dripsSetEvent.blockTimestamp) * 1000),
        balance: {
          tokenAddress: assetConfigMetadata.tokenAddress,
          amount: dripsSetEvent.balance,
        },
        runsOutOfFunds,
        streams: assetConfigHistoryItemStreams,
      });
    }

    const currentStreams = assetConfigHistoryItems[assetConfigHistoryItems.length - 1].streams;

    acc.push({
      tokenAddress: assetConfigMetadata.tokenAddress,
      streams: assetConfigMetadata.streams.map((streamMetadata) => {
        const streamId = makeStreamId(
          accountMetadata.describes.userId,
          assetConfigMetadata.tokenAddress,
          streamMetadata.initialDripsConfig.raw,
        );

        return {
          id: streamId,
          sender: {
            driver: 'address',
            userId: accountMetadata.describes.userId,
            address: AddressDriverClient.getUserAddress(accountMetadata.describes.userId),
          },
          receiver: {
            ...streamMetadata.receiver,
            address: AddressDriverClient.getUserAddress(streamMetadata.receiver.userId),
          },
          dripsConfig: {
            raw: BigInt(streamMetadata.initialDripsConfig.raw),
            amountPerSecond: {
              tokenAddress: assetConfigMetadata.tokenAddress,
              amount: streamMetadata.initialDripsConfig.amountPerSecond,
            },
            startDate: streamMetadata.initialDripsConfig.startTimestamp
              ? new Date(streamMetadata.initialDripsConfig.startTimestamp * 1000)
              : undefined,
            durationSeconds:
              streamMetadata.initialDripsConfig.durationSeconds > 0
                ? streamMetadata.initialDripsConfig.durationSeconds
                : undefined,
            dripId: streamMetadata.initialDripsConfig.dripId,
          },
          paused:
            currentStreams.find((stream) => stream.streamId === streamId)?.dripsConfig ===
            undefined,
          managed: currentStreams.find((stream) => stream.streamId === streamId)?.managed ?? true,
          name: streamMetadata.name,
          description: streamMetadata.description,
          archived: streamMetadata.archived,
        };
      }),
      history: assetConfigHistoryItems,
    });

    return acc;
  }, []);
}

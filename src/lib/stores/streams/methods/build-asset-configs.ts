import { AddressDriverClient, constants, Utils } from 'radicle-drips';
import type { z } from 'zod';
import type { AssetConfig, AssetConfigHistoryItem, DripsConfig, Receiver, Stream } from '../types';
import makeStreamId from './make-stream-id';
import assert from '$lib/utils/assert';
import matchMetadataStreamToReceiver from './match-metadata-stream-to-receiver';
import type { DripsSetEventWithFullReceivers } from './reconcile-drips-set-receivers';
import type {
  addressDriverAccountMetadataSchema,
  assetConfigMetadataSchema,
} from '$lib/utils/metadata/schemas';
import type { AddressDriverAccount } from '$lib/utils/metadata/types';

function mapReceiverToStream(
  receiver: Receiver,
  senderUserId: string,
  tokenAddress: string,
  assetConfigMetadata?: z.infer<typeof assetConfigMetadataSchema>,
): Stream {
  const streamMetadata = assetConfigMetadata?.streams.find(
    (streamMetadata) => streamMetadata.id === receiver.streamId,
  );
  const initialDripsConfig = streamMetadata?.initialDripsConfig;

  const dripsConfig: DripsConfig | undefined =
    receiver.dripsConfig ||
    (initialDripsConfig && {
      dripId: initialDripsConfig.dripId,
      raw: BigInt(initialDripsConfig.raw),
      amountPerSecond: {
        amount: initialDripsConfig.amountPerSecond,
        tokenAddress,
      },
      startDate:
        initialDripsConfig.startTimestamp && initialDripsConfig.startTimestamp > 0
          ? new Date(initialDripsConfig.startTimestamp * 1000)
          : undefined,
      durationSeconds:
        initialDripsConfig.durationSeconds !== 0 ? initialDripsConfig.durationSeconds : undefined,
    });

  assert(
    dripsConfig,
    'Both stream metadata and on-chain data cannot have an undefined dripsConfig',
  );

  return {
    id: receiver.streamId,
    sender: {
      driver: 'address',
      userId: senderUserId,
      address: AddressDriverClient.getUserAddress(senderUserId),
    },
    receiver: receiver.receiver,
    dripsConfig,
    paused: !receiver.dripsConfig,
    managed: Boolean(streamMetadata),
    name: streamMetadata?.name,
    description: streamMetadata?.description,
    archived: streamMetadata?.archived ?? false,
  };
}

/**
 * Given accountMetadata and on-chain dripsSetEvents, construct an object describing
 * the account, including the full history of all its assetConfigs, with on-chain receivers
 * matched onto IPFS stream metadata.
 * @param userId The userId to build assetConfigs for.
 * @param accountMetadata The metadata for the given account fetched from IPFS.
 * @param dripsSetEvents The on-chain history of dripsSetEvents for the given account.
 * @returns The constructed Account object.
 * @throw An error if an assetConfig exists in metadata that no dripsSet events exist for.
 * @throw An error if any of the receivers existing onChain match multiple streams described
 * in metadata.
 */
export default function buildAssetConfigs(
  userId: string,
  accountMetadata: z.infer<typeof addressDriverAccountMetadataSchema> | undefined,
  dripsSetEvents: { [tokenAddress: string]: DripsSetEventWithFullReceivers[] },
) {
  return Object.entries(dripsSetEvents).reduce<AssetConfig[]>(
    (acc, [tokenAddress, assetConfigDripsSetEvents]) => {
      const assetConfigMetadata = accountMetadata?.assetConfigs.find(
        (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
      );

      assert(
        assetConfigDripsSetEvents && assetConfigDripsSetEvents.length > 0,
        `Unable to find dripsSet events for asset config with token address ${tokenAddress}`,
      );

      const assetConfigHistoryItems: AssetConfigHistoryItem[] = [];

      for (const dripsSetEvent of assetConfigDripsSetEvents) {
        const assetConfigHistoryItemStreams: Receiver[] = [];

        const remainingStreamIds =
          assetConfigMetadata?.streams.map((stream) =>
            makeStreamId(userId, tokenAddress, stream.initialDripsConfig.dripId),
          ) ?? [];

        for (const dripsReceiverSeenEvent of dripsSetEvent.currentReceivers) {
          const matchingStream = matchMetadataStreamToReceiver(
            dripsReceiverSeenEvent,
            assetConfigMetadata?.streams ?? [],
          );

          const eventConfig = Utils.DripsReceiverConfiguration.fromUint256(
            dripsReceiverSeenEvent.config,
          );

          const streamId = makeStreamId(userId, tokenAddress, eventConfig.dripId.toString());

          assetConfigHistoryItemStreams.push({
            streamId,
            dripsConfig: {
              raw: dripsReceiverSeenEvent.config,
              startDate:
                eventConfig.start > 0n ? new Date(Number(eventConfig.start) * 1000) : undefined,
              amountPerSecond: {
                amount: eventConfig.amountPerSec,
                tokenAddress,
              },
              dripId: eventConfig.dripId.toString(),
              durationSeconds: eventConfig.duration > 0n ? Number(eventConfig.duration) : undefined,
            },
            managed: Boolean(matchingStream),
            receiver: {
              address: AddressDriverClient.getUserAddress(dripsReceiverSeenEvent.receiverUserId),
              driver: 'address',
              userId: String(dripsReceiverSeenEvent.receiverUserId),
            },
          });

          remainingStreamIds.splice(remainingStreamIds.indexOf(streamId), 1);
        }

        /*
        If a particular stream doesn't appear within dripsReceiverSeenEvents of a given
        dripsSet event, but did at least once before, we can assume it is paused.
        */
        for (const remainingStreamId of remainingStreamIds) {
          const stream = assetConfigMetadata?.streams.find(
            (stream) => stream.id === remainingStreamId,
          );
          if (!stream) break;

          const streamExistedBefore = assetConfigHistoryItems.find((item) =>
            item.streams.find((stream) => stream.streamId === remainingStreamId),
          );

          if (streamExistedBefore) {
            assetConfigHistoryItemStreams.push({
              streamId: remainingStreamId,
              // Undefined dripsConfig == stream was paused
              dripsConfig: undefined,
              managed: true,
              receiver: {
                ...(stream.receiver as AddressDriverAccount),
                address: AddressDriverClient.getUserAddress(stream.receiver.userId),
              },
            });
          }
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
            tokenAddress: tokenAddress,
            amount: dripsSetEvent.balance * BigInt(constants.AMT_PER_SEC_MULTIPLIER),
          },
          runsOutOfFunds,
          streams: assetConfigHistoryItemStreams,
          historyHash: dripsSetEvent.dripsHistoryHash,
          receiversHash: dripsSetEvent.receiversHash,
        });
      }

      const currentStreams = assetConfigHistoryItems[assetConfigHistoryItems.length - 1].streams;

      acc.push({
        tokenAddress: tokenAddress,
        streams: currentStreams.map((receiver) =>
          mapReceiverToStream(receiver, userId, tokenAddress, assetConfigMetadata),
        ),
        history: assetConfigHistoryItems,
      });

      return acc;
    },
    [],
  );
}

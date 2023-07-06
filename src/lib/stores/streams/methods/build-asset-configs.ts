import { AddressDriverClient, constants, Utils } from 'radicle-drips';
import type { z } from 'zod';
import type {
  AddressDriverAccount,
  AssetConfig,
  AssetConfigHistoryItem,
  DripsConfig,
  Receiver,
  Stream,
} from '../types';
import makeStreamId from './make-stream-id';
import assert from '$lib/utils/assert';
import matchMetadataStreamToReceiver from './match-metadata-stream-to-receiver';
import type { StreamsSetEventWithFullReceivers } from './reconcile-drips-set-receivers';
import type {
  addressDriverAccountMetadataSchema,
  assetConfigMetadataSchema,
} from '$lib/utils/metadata/schemas';
import buildStreamReceiver from './build-stream-receiver';

function mapReceiverToStream(
  receiver: Receiver,
  senderAccountId: string,
  tokenAddress: string,
  assetConfigMetadata?: z.infer<typeof assetConfigMetadataSchema>,
): Stream {
  const streamMetadata = assetConfigMetadata?.streams.find(
    (streamMetadata) => streamMetadata.id === receiver.streamId,
  );
  const initialDripsConfig = streamMetadata?.initialDripsConfig;

  const streamConfig: DripsConfig | undefined =
    receiver.streamConfig ||
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
    streamConfig,
    'Both stream metadata and on-chain data cannot have an undefined streamConfig',
  );

  return {
    id: receiver.streamId,
    sender: {
      driver: 'address',
      accountId: senderAccountId,
      address: AddressDriverClient.getUserAddress(senderAccountId),
    },
    receiver: receiver.receiver,
    streamConfig,
    paused: !receiver.streamConfig,
    managed: Boolean(streamMetadata),
    name: streamMetadata?.name,
    description: streamMetadata?.description,
    archived: streamMetadata?.archived ?? false,
  };
}

/**
 * Given accountMetadata and on-chain streamsSetEvents, construct an object describing
 * the account, including the full history of all its assetConfigs, with on-chain receivers
 * matched onto IPFS stream metadata.
 * @param accountId The accountId to build assetConfigs for.
 * @param accountMetadata The metadata for the given account fetched from IPFS.
 * @param streamsSetEvents The on-chain history of streamsSetEvents for the given account.
 * @returns The constructed Account object.
 * @throw An error if an assetConfig exists in metadata that no streamsSet events exist for.
 * @throw An error if any of the receivers existing onChain match multiple streams described
 * in metadata.
 */
export default function buildAssetConfigs(
  accountId: string,
  accountMetadata: z.infer<typeof addressDriverAccountMetadataSchema> | undefined,
  streamsSetEvents: { [tokenAddress: string]: StreamsSetEventWithFullReceivers[] },
) {
  return Object.entries(streamsSetEvents).reduce<AssetConfig[]>(
    (acc, [tokenAddress, assetConfigStreamsSetEvents]) => {
      const assetConfigMetadata = accountMetadata?.assetConfigs.find(
        (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
      );

      assert(
        assetConfigStreamsSetEvents && assetConfigStreamsSetEvents.length > 0,
        `Unable to find streamsSet events for asset config with token address ${tokenAddress}`,
      );

      const assetConfigHistoryItems: AssetConfigHistoryItem[] = [];

      for (const streamsSetEvent of assetConfigStreamsSetEvents) {
        const assetConfigHistoryItemStreams: Receiver[] = [];

        const remainingStreamIds =
          assetConfigMetadata?.streams.map((stream) =>
            makeStreamId(accountId, tokenAddress, stream.initialDripsConfig.dripId),
          ) ?? [];

        for (const streamReceiverSeenEvent of streamsSetEvent.currentReceivers) {
          const matchingStream = matchMetadataStreamToReceiver(
            streamReceiverSeenEvent,
            assetConfigMetadata?.streams ?? [],
          );

          const eventConfig = Utils.StreamConfiguration.fromUint256(streamReceiverSeenEvent.config);

          const streamId = makeStreamId(accountId, tokenAddress, eventConfig.dripId.toString());

          const receiver = buildStreamReceiver(streamReceiverSeenEvent.receiverAccountId);

          assetConfigHistoryItemStreams.push({
            streamId,
            streamConfig: {
              raw: streamReceiverSeenEvent.config,
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
            receiver,
          });

          remainingStreamIds.splice(remainingStreamIds.indexOf(streamId), 1);
        }

        /*
        If a particular stream doesn't appear within streamReceiverSeenEvents of a given
        streamsSet event, but did at least once before, we can assume it is paused.
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
              // Undefined streamConfig == stream was paused
              streamConfig: undefined,
              managed: true,
              receiver: {
                ...(stream.receiver as AddressDriverAccount),
                address: AddressDriverClient.getUserAddress(stream.receiver.accountId),
              },
            });
          }
        }

        let runsOutOfFunds: Date | undefined;

        // If maxEnd is the largest possible timestamp, all current streams end before balance is depleted.
        if (streamsSetEvent.maxEnd === 2n ** 32n - 1n) {
          runsOutOfFunds = undefined;
        } else if (streamsSetEvent.maxEnd === 0n) {
          runsOutOfFunds = undefined;
        } else {
          runsOutOfFunds = new Date(Number(streamsSetEvent.maxEnd) * 1000);
        }

        assetConfigHistoryItems.push({
          timestamp: new Date(Number(streamsSetEvent.blockTimestamp) * 1000),
          balance: {
            tokenAddress: tokenAddress,
            amount: streamsSetEvent.balance * BigInt(constants.AMT_PER_SEC_MULTIPLIER),
          },
          runsOutOfFunds,
          streams: assetConfigHistoryItemStreams,
          historyHash: streamsSetEvent.streamsHistoryHash,
          receiversHash: streamsSetEvent.receiversHash,
        });
      }

      const currentStreams = assetConfigHistoryItems[assetConfigHistoryItems.length - 1].streams;

      acc.push({
        tokenAddress: tokenAddress,
        streams: currentStreams.map((receiver) =>
          mapReceiverToStream(receiver, accountId, tokenAddress, assetConfigMetadata),
        ),
        history: assetConfigHistoryItems,
      });

      return acc;
    },
    [],
  );
}

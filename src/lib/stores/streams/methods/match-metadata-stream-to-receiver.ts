import { Utils } from 'radicle-drips';
import type { z } from 'zod';
import type { streamMetadataSchema } from '../metadata';

/**
 * Given a particular dripsReceiverSeenEvent, find matching metadata from an array of metadata
 * stream objects and return the first match.
 * @param receiverSeenEvent The on-chain receiverSeenEvent to find a matching metadata object for.
 * @param metadataStreams The stream metadata objects to match against the receiverSeenEvent.
 * @returns The matching streamMetadata object, or undefined if none.
 * @throw An error if multiple stream metadata objects match the given receiverSeenEvent, because
 * that should never happen.
 */
export default function matchMetadataStreamToReceiver(
  receiverSeenEvent: { receiverUserId: bigint; config: bigint },
  metadataStreams: z.infer<typeof streamMetadataSchema>[],
): z.infer<typeof streamMetadataSchema> | undefined {
  const dripsReceiverSeenEventConfig = Utils.DripsReceiverConfiguration.fromUint256(
    receiverSeenEvent.config,
  );

  const results = metadataStreams.filter((stream) => {
    const receiverMatch = stream.receiver.userId === receiverSeenEvent.receiverUserId.toString();

    /*
    We're not comparing against the "real" on-chain config of the dripsReceiverSeenEvent
    because the `duration` value may change when a user unpauses a previously-paused stream.
    By taking the value for `duration` from the stream metadata object instead,
    we can match dripsConfigs with different durations, resulting in a match even if the
    stream has been unpaused, resulting in a possibly divergent duration vs. the original
    drips config of the stream.

    This may lead to problems in cases where the user has multiple streams to the same receiver
    that have exactly the same amountPerSec, start and duration.

    A protocol-level change for introducing the ability to set an arbitrary identifier for a
    receiver is being discussed, and would allow resolving this potential edge case.
    */
    const dripsConfigToCompare = Utils.DripsReceiverConfiguration.toUint256({
      start: dripsReceiverSeenEventConfig.start,
      amountPerSec: dripsReceiverSeenEventConfig.amountPerSec,
      duration: BigInt(stream.initialDripsConfig.durationSeconds),
    });

    const dripsConfigMatch = dripsConfigToCompare === BigInt(stream.initialDripsConfig.raw);

    return receiverMatch && dripsConfigMatch;
  });

  if (results.length > 1) {
    throw new Error('Metadata stream object somehow matches multiple on-chain receivers.');
  }

  return results[0];
}

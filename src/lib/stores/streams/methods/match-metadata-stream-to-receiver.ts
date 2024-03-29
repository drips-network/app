import type { addressDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
import type { AnyVersion } from '@efstajas/versioned-parser/lib/types';
import { Utils } from 'radicle-drips';

type StreamMetadata = AnyVersion<
  typeof addressDriverAccountMetadataParser
>['assetConfigs'][number]['streams'][number];

/**
 * Given a particular streamReceiverSeenEvent, find matching metadata from an array of metadata
 * stream objects and return the first match.
 * @param receiverSeenEvent The on-chain receiverSeenEvent to find a matching metadata object for.
 * @param metadataStreams The stream metadata objects to match against the receiverSeenEvent.
 * @returns The matching streamMetadata object, or undefined if none.
 * @throw An error if multiple stream metadata objects match the given receiverSeenEvent, because
 * that should never happen.
 */
export default function matchMetadataStreamToReceiver(
  receiverSeenEvent: { receiverAccountId: string; config: bigint },
  metadataStreams: StreamMetadata[],
): StreamMetadata | undefined {
  const results = metadataStreams.filter(
    (stream) =>
      stream.initialDripsConfig.dripId ===
      Utils.StreamConfiguration.fromUint256(receiverSeenEvent.config).dripId.toString(),
  );

  if (results.length > 1) {
    throw new Error('Metadata stream object somehow matches multiple on-chain receivers.');
  }

  return results[0];
}

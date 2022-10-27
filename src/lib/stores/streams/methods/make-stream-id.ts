import assert from '$lib/utils/assert';

/**
 * Create a globally unique Stream ID string, including the stream's sender user ID and the associated receiver's
 * dripId, as well as the token address.
 * @param senderUserId The stream sender's userId.
 * @param tokenAddress The token address of the currency the stream is in.
 * @param dripId The dripId of the stream's associated receiver.
 * @returns The stream ID string.
 */
export default function makeStreamId(senderUserId: string, tokenAddress: string, dripId: string) {
  return `${senderUserId}-${tokenAddress}-${dripId}`;
}

/**
 * Given a stream ID created with `makeStreamId`, decode it into its three parts; the sender's user ID, the token
 * address and the dripId of the on-chain receiver.
 * @param streamId The stream ID to decode.
 * @returns An object including the stream's sender user ID, the token address of the token the stream is streaming,
 * and the on-chain dripId.
 */
export function decodeStreamId(streamId: string) {
  const parts = streamId.split('-');

  assert(parts.length === 3, 'Invalid stream ID');

  return {
    senderUserId: parts[0],
    tokenAddress: parts[1],
    dripId: parts[2],
  };
}

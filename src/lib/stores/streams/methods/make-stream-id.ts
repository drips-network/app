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

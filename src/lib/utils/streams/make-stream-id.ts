import assert from '$lib/utils/assert';
import { isAddress } from 'ethers';

const numericTest = /^\d+$/;

/**
 * Create a globally unique Stream ID string, including the stream's sender user ID and the associated receiver's
 * dripId, as well as the token address.
 * @param senderAccountId The stream sender's accountId.
 * @param tokenAddress The token address of the currency the stream is in.
 * @param dripId The dripId of the stream's associated receiver.
 * @returns The stream ID string.
 */
export default function makeStreamId(
  senderAccountId: string,
  tokenAddress: string,
  dripId: string,
) {
  if (!(numericTest.test(senderAccountId) && numericTest.test(dripId) && isAddress(tokenAddress))) {
    throw new Error('Invalid values');
  }

  return `${senderAccountId}-${tokenAddress.toLowerCase()}-${dripId}`;
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

  const values = {
    senderAccountId: parts[0],
    tokenAddress: parts[1].toLowerCase(),
    dripId: parts[2],
  };

  if (
    !(
      numericTest.test(values.senderAccountId) &&
      numericTest.test(values.dripId) &&
      isAddress(values.tokenAddress)
    )
  ) {
    throw new Error('Invalid stream ID');
  }

  return values;
}

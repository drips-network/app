import { ethers } from 'ethers';

/**
 * Keeps generating a random bigint with a length of `bytes`, until the result
 * is no longer included in an array of `existing` bigints.
 * @param existing The array of bigints to ensure uniqueness against.
 * @param bytes The amount of bytes to generate the random bigint with.
 * @returns The random bigint, which is guaranteed to be unique against values in `existing`.
 */
export default function (existing: bigint[], bytes: number) {
  let result: bigint | undefined = undefined;

  while (!result || existing.includes(result)) {
    result = ethers.BigNumber.from(ethers.utils.randomBytes(bytes)).toBigInt();
  }

  return result;
}

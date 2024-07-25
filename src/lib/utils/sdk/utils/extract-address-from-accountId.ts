import { getAddress, MaxUint256 } from 'ethers';
import isAddressDriverId from './is-address-driver-id';
import type { OxString } from '../sdk-types';

export default function extractAddressFromAccountId(accountId: string): string {
  if (!accountId) {
    throw new Error(`Could not get user address: accountId is missing.`);
  }

  const accountIdAsBn = BigInt(accountId);

  if (accountIdAsBn < 0 || accountIdAsBn > MaxUint256) {
    throw new Error(
      `Could not get user address: ${accountId} is not a valid positive number within the range of a uint256.`,
    );
  }

  if (isAddressDriverId(accountId)) {
    const mid64BitsMask = (BigInt(2) ** BigInt(64) - BigInt(1)) << BigInt(160);

    if ((accountIdAsBn & mid64BitsMask) !== BigInt(0)) {
      throw new Error(
        `Could not get user address: ${accountId} is not a valid user ID. The first 64 (after first 32) bits must be 0.`,
      );
    }
  }

  const mask = BigInt(2) ** BigInt(160) - BigInt(1);
  const address = accountIdAsBn & mask;

  const paddedAddress = address.toString(16).padStart(40, '0').toLowerCase();

  return getAddress(`0x${paddedAddress}`) as OxString;
}

import { isAddress } from 'ethers';

export function calcAccountId(addr: string): bigint {
  if (!isAddress(addr)) {
    throw new Error('Invalid Ethereum address format');
  }

  const driverId = 0;

  const addrBigInt = BigInt(addr);

  // Shift left by 224 bits to make space for the address
  let accountId = BigInt(driverId) << 224n;

  // Combine the shifted driverId and the address BigInt
  accountId |= addrBigInt;

  return accountId;
}

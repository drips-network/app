export function extractDriverNameFromAccountId(
  id: string,
): 'address' | 'nft' | 'immutableSplits' | 'repo' {
  if (Number.isNaN(Number(id))) {
    throw new Error(`Could not get bits: ${id} is not a number.`);
  }

  const accountIdAsBigInt = BigInt(id);

  if (accountIdAsBigInt < 0n || accountIdAsBigInt > 2n ** 256n - 1n) {
    throw new Error(
      `Could not get bits: ${id} is not a valid positive number within the range of a uint256.`,
    );
  }

  const mask = 2n ** 32n - 1n; // 32 bits mask

  const bits = (accountIdAsBigInt >> 224n) & mask;

  switch (bits) {
    case 0n:
      return 'address';
    case 1n:
      return 'nft';
    case 2n:
      return 'immutableSplits';
    case 3n:
      return 'repo';
    default:
      throw new Error(`Unknown driver for ID ${id}.`);
  }
}

import { utils } from 'ethers';
import { constants } from 'radicle-drips';

const MAX_DECIMAL_ZEROES = 8;
const MIN_DECIMAL_ZEROES = 2;

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

function countDecimals(num: number) {
  if (isNaN(+num)) return 0;
  const decimals = (num + '').split('.')[1];
  if (decimals) return decimals.length;
  return 0;
}

/**
 * Format `amount` into a human-friendly format given a `tokenDecimals` diminisher and
 * `precisionMultiplier`. The latter is 10 ^ 9 by default, given that that is the amount
 * of extra precision the Drips app operates at for most amounts.
 * @param amount The amount to format.
 * @param tokenDecimals The number of decimals to apply to the amount (18 for most ERC-20 tokens).
 * @param precisionMultiplier The precision multiplier to apply, 10 ^ 8 by default.
 * @returns The formatted value as a string.
 */
export default function formatTokenAmount(
  amount: Amount,
  tokenDecimals: number,
  precisionMultiplier = BigInt(constants.AMT_PER_SEC_MULTIPLIER),
) {
  const parsed = parseFloat(utils.formatUnits(amount.amount / precisionMultiplier, tokenDecimals));
  const decimalCount = countDecimals(parsed);

  return `${parsed.toFixed(
    Math.max(Math.min(MAX_DECIMAL_ZEROES, decimalCount), MIN_DECIMAL_ZEROES),
  )}`;
}

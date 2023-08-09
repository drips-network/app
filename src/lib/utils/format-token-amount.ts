import { utils } from 'ethers';
import { constants } from 'radicle-drips';

const MAX_DECIMAL_ZEROES_IN_MOTION = 8;

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

/**
 * Format `amount` into a human-friendly format given a `tokenDecimals` diminisher and
 * `precisionMultiplier`. The latter is 10 ^ 9 by default, given that that is the amount
 * of extra precision the Drips app operates at for most amounts.
 * @param amount The amount to format.
 * @param tokenDecimals The number of decimals to apply to the amount (18 for most ERC-20 tokens).
 * @param precisionMultiplier The precision multiplier to apply, 10 ^ 8 by default.
 * @param preserveTrailingZeroes Pad amount to `maxDecimals` with zeroes always to prevent UI jitter.
 * @param maxDecimals The maximum number of decimal points to display. By default, up to 8, but less if
 * the token has fewer decimals.
 * @returns The formatted value as a string.
 */
export default function formatTokenAmount(
  amount: Amount | bigint,
  tokenDecimals: number,
  precisionMultiplier = BigInt(constants.AMT_PER_SEC_MULTIPLIER),
  preserveTrailingZeroes = true,
  maxDecimals = Math.min(MAX_DECIMAL_ZEROES_IN_MOTION, tokenDecimals),
) {
  amount = typeof amount === 'bigint' ? amount : amount.amount;

  if (amount === 0n) return '0.00';

  const parsedAmount = parseFloat(utils.formatUnits(amount / precisionMultiplier, tokenDecimals));

  const formatted = `${parsedAmount.toFixed(maxDecimals)}`;

  const isTiny =
    (formatted === (0).toFixed(maxDecimals) || formatted === '-' + (0).toFixed(maxDecimals)) &&
    amount !== 0n;

  if (isTiny) return amount < 0n ? '- <0.00000001' : ' <0.00000001';
  if (!preserveTrailingZeroes) return Number(formatted).toString();

  return formatted;
}

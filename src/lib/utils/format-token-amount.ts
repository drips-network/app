import { formatUnits } from 'ethers';
import contractConstants from './sdk/utils/contract-constants';

const MAX_DECIMAL_ZEROES_IN_MOTION = 8;

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

interface LocalDecimalOptions {
  min?: number | undefined;
  max?: number | undefined;
}

/**
 * Format number into local number string with decimal options
 * @param value The amount to format.
 * @param decimals The decimal options.
 * @returns The formatted value as a string.
 */
export function localDecimal(
  value: number,
  decimals: LocalDecimalOptions,
  locale: string | undefined = 'en-US',
) {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals?.min,
    maximumFractionDigits: decimals?.max,
  });
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
  precisionMultiplier = BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER),
  preserveTrailingZeroes = true,
  maxDecimals = Math.min(MAX_DECIMAL_ZEROES_IN_MOTION, Number(tokenDecimals)),
) {
  amount = typeof amount === 'bigint' ? amount : amount.amount;

  if (amount === 0n) return localDecimal(0, { min: 2 });

  const parsedAmount = parseFloat(formatUnits(amount / precisionMultiplier, tokenDecimals));

  const paddedAmount = localDecimal(parsedAmount, { min: maxDecimals });

  const isTinyAmount =
    amount !== 0n &&
    (paddedAmount === localDecimal(0, { min: maxDecimals }) ||
      paddedAmount === '-' + localDecimal(0, { min: maxDecimals }));

  if (isTinyAmount) return amount < 0n ? '- <0.00000001' : ' <0.00000001';
  if (preserveTrailingZeroes) return paddedAmount;

  return localDecimal(parsedAmount, { max: maxDecimals });
}

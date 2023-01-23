import { utils } from 'ethers';
import { constants } from 'radicle-drips';

const MAX_DECIMAL_ZEROES = 8;

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
 * @returns The formatted value as a string.
 */
export default function formatTokenAmount(
  amount: Amount | bigint,
  tokenDecimals: number,
  precisionMultiplier = BigInt(constants.AMT_PER_SEC_MULTIPLIER),
) {
  amount = typeof amount === 'bigint' ? amount : amount.amount;

  if (amount === 0n) return '0.00';

  const parsedAmount = parseFloat(utils.formatUnits(amount / precisionMultiplier, tokenDecimals));
  const amountDecimals = MAX_DECIMAL_ZEROES;

  const formatted = `${parsedAmount.toFixed(amountDecimals)}`;

  const isTiny =
    (formatted === (0).toFixed(amountDecimals) ||
      formatted === '-' + (0).toFixed(amountDecimals)) &&
    amount !== 0n;

  return isTiny ? (amount < 0n ? '- <0.00000001' : ' <0.00000001') : formatted;
}

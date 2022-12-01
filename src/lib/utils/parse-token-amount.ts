import { parseUnits } from 'ethers/lib/utils';

/**
 * Attempts parsing a given input as wei with a given amount of decimal precision.
 * @param input The string to attempt parsing.
 * @returns The bigint value of the parsed input at the given decimal precision, or undefined
 * if parsing failed.
 */
export default function (input: string, decimals: number): bigint | undefined {
  try {
    return parseUnits(input, decimals).toBigInt();
  } catch {
    return undefined;
  }
}

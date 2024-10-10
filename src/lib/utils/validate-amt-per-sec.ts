import type { TextInputValidationState } from '$lib/components/text-input/text-input';
import contractConstants from './sdk/utils/contract-constants';

/**
 * Constant representation of Drips's cycle_secs value. This value
 * is immutable per deployment, so only needs to be changed when pointing
 * the app at a new deployment.
 *
 * TODO: This constant should probably be moved to the SDK package.
 */
const CYCLE_SECS = 604800;

/**
 * Take an amtPerSec value (with extra precision) and ensure it results in
 * streaming more than 1 wei of a token at the given decimal precision each cycle.
 * If it would stream less than 1 wei per cycle, the amtPerSec is considered invalid,
 * as it would effectively result in a stopped stream.
 * @param amtPerSec The amtPerSec value with extra precision to validate.
 */
export default function validateAmtPerSec(amtPerSec: bigint) {
  const amtPerCycle = amtPerSec * BigInt(CYCLE_SECS);
  const weiPerCycle = amtPerCycle / BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER);

  return weiPerCycle >= 1n;
}

/**
 * Take an amtPerSec input (with extra precision) and validate it, returning a
 * TextInputValidationState with an appropriate error message if necessary.
 * @param amtPerSec The amtPerSec value with extra precision to validate, or undefined
 * if the user has not yet entered a value.
 * @returns The appropriate TextInputValidationState for the input.
 */
export function validateAmtPerSecInput(amtPerSec?: bigint): TextInputValidationState {
  if (amtPerSec === undefined) return { type: 'unvalidated' };

  const validationResult = validateAmtPerSec(amtPerSec);

  return validationResult
    ? {
        type: 'valid',
      }
    : {
        type: 'invalid',
        message: 'The stream rate must be higher than 1 wei / week.',
      };
}

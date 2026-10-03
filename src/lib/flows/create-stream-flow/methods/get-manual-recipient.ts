import type { TextInputValidationState } from '$lib/components/text-input/text-input';
import { isAddress } from 'ethers';
import type { CreateStreamFlowState } from '../create-stream-flow-state';

export type ManualRecipient =
  | { type: 'address'; address: string }
  | { type: 'drip-list'; accountId: string };

/**
 * Returns the recipient entered manually into the "Stream to" input, or `undefined`
 * if the input is not (yet) valid.
 *
 * The recipient is read from `recipientValidatedValue` (the resolved address or Drip List
 * account ID), never from `recipientInputValue`, which holds what the user typed (e.g. an
 * ENS name or a Drip List URL) and is not usable as a recipient as-is.
 */
export default function getManualRecipient(
  state: Pick<CreateStreamFlowState, 'recipientInputValue' | 'recipientValidatedValue'>,
  validationState: TextInputValidationState,
): ManualRecipient | undefined {
  if (validationState.type !== 'valid') return undefined;

  const recipient = state.recipientValidatedValue;
  if (!recipient) return undefined;

  return isAddress(recipient)
    ? { type: 'address', address: recipient }
    : { type: 'drip-list', accountId: recipient };
}

import modal from '$lib/stores/modal';
import wallet from '$lib/stores/wallet';
import etherscanLink from '$lib/utils/etherscan-link';
import type { ContractReceipt, ContractTransaction } from 'ethers';
import Emoji from 'radicle-design-system/Emoji.svelte';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import type { Nullable } from 'vitest';
import type { StepComponentEvents, UpdateAwaitStepFn, UpdateAwaitStepParams } from '../types';

type BeforeFunc = () => PromiseLike<Record<string, unknown> | void>;

type Context<T> = T extends BeforeFunc ? Awaited<ReturnType<T>> : undefined;

type TransactPayload<T extends Nullable<BeforeFunc>> = {
  /**
   * Function to run before triggering transactions. You can return an object from this, which
   * will be made available to both the `transactions` and `after` functions as `context`.
   */
  before?: T;
  /**
   * Function that returns an array of objects, each describing a single transaction that should
   * be triggered. You can optionally customize the messages the user will see while the transactions
   * are waiting for signature & confirmation.
   * @param context Object with optional context returned from `before`.
   * @returns An array describing all transactions that should be triggered.
   */
  transactions: (context: Context<T>) => {
    transaction: () => Promise<ContractTransaction>;
    waitingSignatureMessage?: UpdateAwaitStepParams;
    waitingConfirmationMessage?: UpdateAwaitStepParams;
  }[];
  /**
   * Function to run after all transactions are confirmed.
   * @param receipts An array of transaction receipts for all transactions described in `transactions`.
   * @param context Object with optional context returned from `before`.
   * @returns
   */
  after?: (receipts: ContractReceipt[], context: Context<T>) => PromiseLike<void>;
  /**
   * Optionally specify custom messages that appear while the `before` and `after` steps are executed.
   */
  messages?: {
    duringBefore?: UpdateAwaitStepParams;
    duringAfter?: UpdateAwaitStepParams;
  };
};

export type SomeTransactPayload = <R>(
  payload: <T extends Nullable<BeforeFunc>>(transactPayload: TransactPayload<T>) => R,
) => R;

export function makeTransactPayload<T extends Nullable<BeforeFunc>>(
  i: TransactPayload<T>,
): SomeTransactPayload {
  return (cb) => cb(i);
}

/**
 * Utility designed for running a standard "sign, wait for confirmation, update UI" pattern within
 * a stepper flow. Run some logic to prepare one or multiple transactions, execute those transactions,
 * and then run some logic at the end, before advancing the flow.
 * @param dispatch The event dispatcher to use for communicating with the stepper.
 * @param payload Payload for the transact operation. See annotations on the `TransactPayload` type for details.
 */
export default function transact(
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  payload: SomeTransactPayload,
) {
  const resolvedPayload = payload((payload) => payload);

  const { before, transactions: transactionsBuilder, after, messages } = resolvedPayload;

  const receipts: ContractReceipt[] = [];

  const promise = async (updateAwaitStep: UpdateAwaitStepFn) => {
    modal.setHideable(false);

    if (messages?.duringBefore) updateAwaitStep(messages.duringBefore);

    const beforeResult = await before?.();

    const transactions = transactionsBuilder(beforeResult);

    for (const transaction of transactions) {
      updateAwaitStep(
        transaction.waitingSignatureMessage ?? {
          message: 'Waiting for you to sign the transaction in your wallet...',
          icon: {
            component: Emoji,
            props: {
              emoji: '👛',
              size: 'huge',
            },
          },
        },
      );

      const tx = await transaction.transaction();

      updateAwaitStep(
        transaction.waitingConfirmationMessage ?? {
          message: 'Waiting for your transaction to be confirmed',
          link: {
            url: etherscanLink(get(wallet).network.name, tx.hash),
            label: 'View on Etherscan',
          },
        },
      );

      receipts.push(await tx.wait(1));
    }

    updateAwaitStep(
      messages?.duringAfter ?? {
        message: 'Wrapping up...',
      },
    );

    await after?.(receipts, beforeResult);

    modal.setHideable(true);
  };

  dispatch('await', {
    promise: (fn) => promise(fn),
    message: messages?.duringBefore?.message ?? 'Getting ready...',
  });
}

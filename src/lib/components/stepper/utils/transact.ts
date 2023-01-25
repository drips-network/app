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
  before?: T;
  transactions: (context: Context<T>) => {
    transaction: () => Promise<ContractTransaction>;
    waitingSignatureMessage?: UpdateAwaitStepParams;
    waitingConfirmationMessage?: UpdateAwaitStepParams;
  }[];
  after?: (receipts: ContractReceipt[], context: Context<T>) => PromiseLike<void>;
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

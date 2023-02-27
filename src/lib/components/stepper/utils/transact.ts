import modal from '$lib/stores/modal';
import walletStore from '$lib/stores/wallet/wallet.store';
import etherscanLink from '$lib/utils/etherscan-link';
import type { ContractReceipt, ContractTransaction, PopulatedTransaction } from 'ethers';
import Emoji from '$lib/components/emoji/emoji.svelte';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import type { Nullable } from 'vitest';
import type { StepComponentEvents, UpdateAwaitStepFn, UpdateAwaitStepParams } from '../types';
import unreachable from '$lib/utils/unreachable';
import SafeAppsSDK from '$lib/stores/wallet/safe/sdk';

type BeforeFunc = () => PromiseLike<Record<string, unknown> | void>;

type Context<T> = T extends BeforeFunc ? Awaited<ReturnType<T>> : undefined;

type TransactPayload<T extends Nullable<BeforeFunc>> = {
  /**
   * Function to run before triggering transactions. You can return an object from this, which
   * will be made available to both the `transactions` and `after` functions as `context`.
   */
  before?: T;
  /**
   * Function that returns either a single or an array of objects, each describing a transaction that should
   * be triggered. You can optionally customize the messages the user will see while the transactions
   * are waiting for signature & confirmation.
   * @param context Object with optional context returned from `before`.
   * @returns An array describing all transactions that should be triggered.
   */
  transactions: (context: Context<T>) =>
    | {
        transaction: PopulatedTransaction;
        waitingSignatureMessage?: UpdateAwaitStepParams;
        waitingConfirmationMessage?: UpdateAwaitStepParams;
      }[]
    | {
        transaction: () => Promise<ContractTransaction>;
        waitingSignatureMessage?: UpdateAwaitStepParams;
        waitingConfirmationMessage?: UpdateAwaitStepParams;
      };
  /**
   * Function to run after all transactions are confirmed. This function will NOT run if the app is connected
   * to a Safe.
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

function setStepCopyWaitingForSignature(
  updateAwaitStep: UpdateAwaitStepFn,
  safeAppMode: boolean,
  customMessage?: UpdateAwaitStepParams,
) {
  updateAwaitStep(
    customMessage ?? {
      message: safeAppMode
        ? 'Waiting for you to propose the transaction to your safe...'
        : 'Waiting for you to sign the transaction in your wallet...',
      icon: {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      },
    },
  );
}

function setStepCopyWaitingForConfirmation(
  updateAwaitStep: UpdateAwaitStepFn,
  networkName: string,
  txHash: string,
  customMessage?: UpdateAwaitStepParams,
) {
  updateAwaitStep(
    customMessage ?? {
      message: 'Waiting for your transaction to be confirmed',
      link: {
        url: etherscanLink(networkName, txHash),
        label: 'View on Etherscan',
      },
    },
  );
}

/**
 * Utility designed for running a standard "sign, wait for confirmation, update UI" pattern within
 * a stepper flow. Run some logic to prepare one or multiple transactions, execute those transactions,
 * and then run some logic at the end, before advancing the flow.
 *
 * If the app is connected to a safe, the function will instead propose the transaction to the Safe. If the
 * passed TransactPayload includes more than one transaction, it will use the Safe Apps SDK to propose a batch
 * operation to the Safe instead.
 *
 * @param dispatch The event dispatcher to use for communicating with the stepper.
 * @param payload Payload for the transact operation. See annotations on the `TransactPayload` type for details.
 */
export default function transact(
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  payload: SomeTransactPayload,
) {
  const resolvedPayload = payload((payload) => payload);
  const { safe, signer, network } = get(walletStore);
  const safeAppMode = Boolean(safe);

  const { before, transactions: transactionsBuilder, after, messages } = resolvedPayload;

  const receipts: ContractReceipt[] = [];

  const promise = async (updateAwaitStep: UpdateAwaitStepFn) => {
    modal.setHideable(false);

    if (messages?.duringBefore) updateAwaitStep(messages.duringBefore);

    const beforeResult = await before?.();

    const transactions = transactionsBuilder(beforeResult);
    const isTxBatch = Array.isArray(transactions);

    if (safeAppMode && isTxBatch) {
      const safeAppsSdk = new SafeAppsSDK();

      setStepCopyWaitingForSignature(updateAwaitStep, safeAppMode);

      const txs = transactions.map(({ transaction: tx }) => ({
        to: tx.to ?? unreachable(),
        data: tx.data ?? unreachable(),
        value: '0',
      }));

      await safeAppsSdk.txs.send({ txs });
    } else if (isTxBatch) {
      for (const transaction of transactions) {
        setStepCopyWaitingForSignature(
          updateAwaitStep,
          safeAppMode,
          transaction.waitingSignatureMessage,
        );

        const tx = await (signer ?? unreachable()).sendTransaction(transaction.transaction);

        setStepCopyWaitingForConfirmation(updateAwaitStep, network.name, tx.hash);

        receipts.push(await tx.wait(1));
      }
    } else {
      setStepCopyWaitingForSignature(
        updateAwaitStep,
        safeAppMode,
        transactions.waitingSignatureMessage,
      );

      const tx = await transactions.transaction();

      setStepCopyWaitingForConfirmation(updateAwaitStep, network.name, tx.hash);

      receipts.push(await tx.wait(1));
    }

    if (!safeAppMode) {
      updateAwaitStep(
        messages?.duringAfter ?? {
          message: 'Wrapping up...',
        },
      );

      await after?.(receipts, beforeResult);
    }

    modal.setHideable(true);
  };

  dispatch('await', {
    promise: (fn) => promise(fn),
    message: messages?.duringBefore?.message ?? 'Getting ready...',
  });
}

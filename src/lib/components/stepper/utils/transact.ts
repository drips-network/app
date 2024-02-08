import modal from '$lib/stores/modal';
import walletStore from '$lib/stores/wallet/wallet.store';
import etherscanLink from '$lib/utils/etherscan-link';
import type { ContractReceipt, PopulatedTransaction } from 'ethers';
import Emoji from '$lib/components/emoji/emoji.svelte';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import type { Nullable } from 'vitest';
import type { StepComponentEvents, UpdateAwaitStepFn, UpdateAwaitStepParams } from '../types';
import unreachable from '$lib/utils/unreachable';
import SafeAppsSDK from '$lib/stores/wallet/safe/sdk';
import assert from '$lib/utils/assert';
import isTest from '$lib/utils/is-test';

type BeforeFunc = () => PromiseLike<Record<string, unknown> | void>;

type Context<T> = T extends BeforeFunc ? Awaited<ReturnType<T>> : undefined;

type TransactionWrapper = {
  transaction: PopulatedTransaction;
  applyGasBuffer: boolean;
  waitingSignatureMessage?: UpdateAwaitStepParams;
  waitingConfirmationMessage?: UpdateAwaitStepParams;
};

export type TransactPayload<T extends Nullable<BeforeFunc>> = {
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
  transactions: (context: Context<T>) => TransactionWrapper[] | Promise<TransactionWrapper[]>;
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
        : 'Waiting for you to confirm the transaction in your wallet...',
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
      message: 'Waiting for your transaction to be confirmed on the network.',
      link: {
        url: etherscanLink(networkName, txHash),
        label: 'View on Etherscan',
      },
    },
  );
}

function applyGasBuffer(gasLimit: number) {
  // 15% buffer because sometimes Drips transactions' complexity varies on-chain second-by-second.
  return Math.ceil(gasLimit * 1.15);
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
  const { safe, signer, network, address } = get(walletStore);
  assert(address);
  const safeAppMode = Boolean(safe);

  const { before, transactions: transactionsBuilder, after, messages } = resolvedPayload;

  const receipts: ContractReceipt[] = [];

  const promise = async (updateAwaitStep: UpdateAwaitStepFn) => {
    modal.setHideable(false);

    if (messages?.duringBefore) updateAwaitStep(messages.duringBefore);

    const beforeResult = await before?.();

    const transactionWrappers = await transactionsBuilder(beforeResult);
    const isTxBatch = transactionWrappers.length > 1;

    // If we're in a Safe and need to process more than one transaction, we send them to the
    // Safe as a batch.
    if (safeAppMode && isTxBatch) {
      const safeAppsSdk = new SafeAppsSDK();

      let estimatedGasWithBuffer: number;
      try {
        // We use a third-party API provided by Tenderly to estimate this batch's gas cost, because
        // its transactions are inter-dependent, meaning they cannot be independently simulated.
        const simulationRes = await (
          await fetch('/api/tenderly/simulate', {
            method: 'POST',
            body: JSON.stringify({
              simulations: transactionWrappers.map((tx) => ({
                network_id: String(network.chainId),
                save: true,
                save_if_fails: true,
                from: address,
                to: tx.transaction.to,
                input: tx.transaction.data,
                value: 0,
                estimate_gas: true,
              })),
            }),
          })
        ).json();

        const estimatedGas = simulationRes.simulation_results.reduce(
          (acc: number, res: { simulation: { gas_used: number } }) => res.simulation.gas_used + acc,
          0,
        );

        assert(typeof estimatedGas === 'number' && estimatedGas > 0);

        estimatedGasWithBuffer = applyGasBuffer(estimatedGas);
      } catch (e) {
        throw new Error('Unable to estimate gas for Safe Batch operation.');
      }

      setStepCopyWaitingForSignature(updateAwaitStep, safeAppMode);

      const txs = transactionWrappers.map(({ transaction: tx }) => ({
        to: tx.to ?? unreachable(),
        data: tx.data ?? unreachable(),
        value: '0',
      }));

      await safeAppsSdk.txs.send({
        txs,
        params: {
          safeTxGas: estimatedGasWithBuffer,
        },
      });
    } else {
      // If we are connected to an EOA wallet, we simply trigger all the transactions in sequence.

      const wrappersWithGas: (TransactionWrapper & { gasLimit: number | undefined })[] =
        transactionWrappers.map((tx) => ({ ...tx, gasLimit: undefined }));

      // If at least one of the transactions has `applyGasBuffer` set to `true`, we need to
      // simulate the entire batch. This is because the transactions may be inter-dependent,
      // meaning they cannot always be independently simulated.
      // In E2E tests, we can't simulate with Tenderly, so we don't.
      const needToSimulate = isTest() ? false : wrappersWithGas.some((tx) => tx.applyGasBuffer);

      if (needToSimulate) {
        try {
          const simulationRes = await (
            await fetch('/api/tenderly/simulate', {
              method: 'POST',
              body: JSON.stringify({
                simulations: wrappersWithGas.map((tx) => ({
                  network_id: String(network.chainId),
                  save: true,
                  save_if_fails: true,
                  from: address,
                  to: tx.transaction.to,
                  input: tx.transaction.data,
                  value: 0,
                  estimate_gas: true,
                })),
              }),
            })
          ).json();

          wrappersWithGas.forEach((wrapper, i) => {
            if (!wrapper.applyGasBuffer) return;

            const res = simulationRes.simulation_results[i];
            const gasUsed = res.simulation.gas_used;

            assert(typeof gasUsed === 'number' && gasUsed > 0);

            wrapper.gasLimit = applyGasBuffer(gasUsed);
          });
        } catch (e) {
          throw new Error(`Unable to estimate gas for transactions: ${e}`);
        }
      }

      for (const wrapper of wrappersWithGas) {
        setStepCopyWaitingForSignature(
          updateAwaitStep,
          safeAppMode,
          wrapper.waitingSignatureMessage,
        );

        const tx = await (signer ?? unreachable()).sendTransaction({
          ...wrapper.transaction,
          gasLimit: wrapper.gasLimit ?? wrapper.transaction.gasLimit,
        });

        setStepCopyWaitingForConfirmation(updateAwaitStep, network.name, tx.hash);

        if (!safeAppMode) receipts.push(await tx.wait(1));
      }
    }

    // In Safe App Mode, `after` is omitted, as the transaction is expected to resolve later.
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

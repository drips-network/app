<script lang="ts">
  import { createEventDispatcher, onMount, type ComponentType } from 'svelte';
  import type {
    BeforeFunc,
    SomeTransactPayload,
    TransactionWrapper,
    TransactPayload,
  } from '../types';
  import { get } from 'svelte/store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import unreachable from '$lib/utils/unreachable';
  import modal from '$lib/stores/modal';
  import SafeAppsSDK, { type SendTransactionsResponse } from '@safe-global/safe-apps-sdk';
  import type { ContractReceipt, Signer } from 'ethers';
  import isTest from '$lib/utils/is-test';
  import type { Nullable } from 'vitest';
  import etherscanLink from '$lib/utils/etherscan-link';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import type { Result } from './await-step.svelte';

  const dispatchResult = createEventDispatcher<{ result: Result }>();
  const dispatchStartOver = createEventDispatcher<{ startOver: void }>();

  export let transactPayload: SomeTransactPayload;

  type TransactionWrapperWithGasLimit = TransactionWrapper & { gasLimit: number | undefined };

  interface TransactionTimelineItem {
    title: string;
    message: string;
    etherscanUrl?: string;
    status:
      | 'awaitingPrevious'
      | 'awaitingSignature'
      | 'pending'
      | 'confirmed'
      | 'failed'
      | 'cancelled'
      | 'rejected'
      | 'retrying'
      | 'finalizing'
      | null;
  }

  let isRetrying = false;
  let failedTxIndex = -1;
  let headline: string = '';
  let isExecutionCompleted = false;

  let resolvedPayload: TransactPayload<Nullable<BeforeFunc>> | undefined;

  let description: string | undefined;
  let duringAfterMsg: string | undefined;
  let duringBeforeMsg: string | undefined;
  let icon:
    | {
        component: ComponentType;
        props?: Record<string, unknown>;
      }
    | undefined;

  let isErrorDetailsVisible = false;
  let error: Error | undefined;
  let transactionsTimeline: TransactionTimelineItem[] = [];

  onMount(async () => {
    await executeTransactions();
  });

  async function executeTransactions(retryIndex: number = 0) {
    if (failedTxIndex !== -1) {
      recalculateTimelineStatuses(retryIndex);
    }

    resolvedPayload = transactPayload((transactPayload) => transactPayload);

    const {
      after,
      before,
      afterSafe,
      icon: resolvedIcon,
      headline: resolvedHeadline,
      messages: resolvedMessages,
      description: resolvedDescription,
      transactions: transactionsBuilder,
    } = resolvedPayload;

    icon = resolvedIcon;
    headline = resolvedHeadline;
    description = resolvedDescription;
    duringAfterMsg = resolvedMessages?.duringAfter;
    duringBeforeMsg = resolvedMessages?.duringBefore;

    const { safe, signer, network, address } = get(walletStore);
    assert(address);

    const safeAppMode = Boolean(safe);

    const contractReceipts: ContractReceipt[] = [];

    const beforeResult = await before?.();

    // If the promise resolves really fast, we ensure it stays for at least 600ms in order to prevent a glitchy step transition.
    const [transactionWrappers] = await Promise.all([
      transactionsBuilder(beforeResult),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);

    if (!transactionsTimeline.length) {
      initTransactionsTimelineItems(transactionWrappers, safeAppMode);
    }

    let safeSendTransactionResponse: SendTransactionsResponse | undefined;

    modal.setHideable(false);

    if (safeAppMode) {
      safeSendTransactionResponse = await handleSafeAppTransactions(
        transactionWrappers,
        network,
        address,
      );
    } else {
      await handleEoaTransactions(
        network,
        address,
        transactionWrappers,
        signer,
        contractReceipts,
        retryIndex,
      );
    }

    if (
      transactionsTimeline.some(
        (tx) => tx.status === 'failed' || tx.status === 'rejected' || tx.status === 'retrying',
      )
    ) {
      return;
    }

    // In Safe App Mode, `after` is omitted, as the transaction is expected to resolve later.
    if (!safeAppMode) {
      try {
        updateTransactionTimelineStatus(transactionWrappers[transactionsTimeline.length - 1], {
          status: 'finalizing',
          message: `Transaction confirmed. ${duringAfterMsg ?? 'Wrapping up...'}`,
        });

        await after?.(contractReceipts, beforeResult);

        updateTransactionTimelineStatus(transactionWrappers[transactionsTimeline.length - 1], {
          status: 'confirmed',
          message: 'Transaction confirmed',
        });
      } catch (e) {
        dispatchResult('result', { success: false, error: e as Error });
      }
    } else if (afterSafe) {
      assert(safeSendTransactionResponse, 'Expected SafeSendTransactionResponse to be defined.');

      try {
        updateTransactionTimelineStatus(transactionWrappers[transactionWrappers.length - 1], {
          status: 'finalizing',
          message: 'Transactions submitted. Waiting for Safe to confirm...',
        });

        await afterSafe?.(safeSendTransactionResponse, beforeResult);

        updateTransactionTimelineStatus(transactionWrappers[transactionWrappers.length - 1], {
          status: 'confirmed',
          message: 'Transactions confirmed by Safe',
        });
      } catch (e) {
        dispatchResult('result', { success: false, error: e as Error });
      }
    }

    isRetrying = false;
    isExecutionCompleted = true;

    modal.setHideable(true);
  }

  async function handleEoaTransactions(
    network: { chainId: number; name: string },
    address: string,
    transactionWrappers: TransactionWrapper[],
    signer: Signer,
    contractReceipts: ContractReceipt[],
    startIndex: number,
  ) {
    // If we are connected to an EOA wallet, we simply trigger all the transactions in sequence.

    const txWrappersWithGas: TransactionWrapperWithGasLimit[] = transactionWrappers.map((tx) => ({
      ...tx,
      gasLimit: undefined,
    }));

    // If at least one of the transactions has `applyGasBuffer` set to `true`, we need to
    // simulate the entire batch. This is because the transactions may be inter-dependent,
    // meaning they cannot always be independently simulated.
    // In E2E tests, we can't simulate with Tenderly, so we don't.
    const needToSimulate = isTest() ? false : txWrappersWithGas.some((tx) => tx.applyGasBuffer);

    if (needToSimulate) {
      try {
        const simulationRes = await (
          await fetch('/api/tenderly/simulate', {
            method: 'POST',
            body: JSON.stringify({
              simulations: txWrappersWithGas.map((tx) => ({
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

        txWrappersWithGas.forEach((txWrapper, i) => {
          if (!txWrapper.applyGasBuffer) return;

          const { estimatedGas } = simulationRes[i];

          assert(typeof estimatedGas === 'number' && estimatedGas > 0);

          txWrapper.gasLimit = getGasBuffer(estimatedGas);

          // TODO: update transaction status with estimated gas when available.
        });
      } catch (e) {
        throw new Error(`Unable to estimate gas for transactions: ${e}`);
      }
    }

    for (let i = startIndex; i < txWrappersWithGas.length; i++) {
      const executingTx = txWrappersWithGas[i];

      try {
        updateTransactionTimelineStatus(executingTx, {
          status: 'awaitingSignature',
          message: 'Waiting for you to confirm the transaction in your wallet',
        });

        const txResponse = await (signer ?? unreachable()).sendTransaction({
          ...executingTx.transaction,
          gasLimit: executingTx.gasLimit ?? executingTx.transaction.gasLimit,
        });

        updateTransactionTimelineStatus(executingTx, {
          status: 'pending',
          message: 'Waiting for confirmations',
        });

        const receipt = await txResponse.wait();
        contractReceipts.push(receipt);

        updateTransactionTimelineStatus(executingTx, {
          status: 'confirmed',
          message: 'Transaction confirmed',
          etherscanUrl: etherscanLink(network.name, receipt.transactionHash),
        });
      } catch (e) {
        const isRejection = (e as Error).message
          .toLowerCase()
          .includes('user rejected transaction');

        if (isRejection) {
          updateTransactionTimelineStatus(executingTx, {
            status: 'rejected',
            message: 'You rejected the transaction',
          });
        } else {
          updateTransactionTimelineStatus(executingTx, {
            status: 'failed',
            message: 'Transaction failed',
          });

          error = e as Error;
        }

        cancelSubsequentTransactions(executingTx, txWrappersWithGas, isRejection);
        failedTxIndex = i;

        break;
      }
    }
  }

  async function handleSafeAppTransactions(
    transactionWrappers: TransactionWrapper[],
    network: { chainId: number },
    address: string,
  ) {
    // If we're in a Safe and need to process more than one transaction, we send them to the Safe as a batch.

    const safeAppsSdk = new SafeAppsSDK();

    let estimatedGasWithBuffer: number;
    try {
      const { estimatedGas } = await (
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

      estimatedGasWithBuffer = getGasBuffer(estimatedGas);
    } catch {
      throw new Error('Unable to estimate gas for Safe Batch operation.');
    }

    const txs = transactionWrappers.map(({ transaction: tx }) => ({
      to: tx.to ?? unreachable(),
      data: tx.data ?? unreachable(),
      value: '0',
    }));

    const response = await safeAppsSdk.txs.send({
      txs,
      params: {
        safeTxGas: estimatedGasWithBuffer,
      },
    });

    transactionsTimeline.forEach((item, index) => {
      updateTransactionTimelineStatus(transactionWrappers[index], {
        status: 'awaitingSignature',
        message: 'Transaction submitted to Safe. Waiting for confirmation...',
      });
    });

    return response;
  }

  function cancelSubsequentTransactions(
    executingTx: TransactionWrapperWithGasLimit,
    txWrappersWithGas: TransactionWrapperWithGasLimit[],
    isRejection: boolean,
  ) {
    for (const tx of txWrappersWithGas) {
      const timelineItem = transactionsTimeline.find((item) => item.title === tx.title);

      if (tx !== executingTx && timelineItem?.status === 'awaitingPrevious') {
        updateTransactionTimelineStatus(tx, {
          status: 'cancelled',
          message: `This transaction was cancelled due to a previous ${isRejection ? 'rejection' : 'failure'}`,
        });
      }
    }
  }

  function recalculateTimelineStatuses(retryIndex: number) {
    error = undefined;
    isRetrying = false;
    failedTxIndex = -1;
    isErrorDetailsVisible = false;

    transactionsTimeline = transactionsTimeline.map((item, index) => {
      if (item.status === 'confirmed') {
        return item;
      }

      if (index === retryIndex) {
        return {
          ...item,
          status: 'retrying',
          message: 'Preparing to retry...',
        };
      }

      return {
        ...item,
        status: 'awaitingPrevious',
        message: 'Waiting on previous transaction',
      };
    });
  }

  async function retryFailedTransaction() {
    isRetrying = true;
    await executeTransactions(failedTxIndex);
  }

  function updateTransactionTimelineStatus(
    txWrapper: TransactionWrapper,
    updates: Partial<TransactionTimelineItem>,
  ) {
    transactionsTimeline = transactionsTimeline.map((item) =>
      item.title === txWrapper.title
        ? {
            ...item,
            ...updates,
          }
        : item,
    );
  }

  function initTransactionsTimelineItems(
    transactionWrappers: TransactionWrapper[],
    safeAppMode: boolean,
  ) {
    if (safeAppMode) {
      transactionsTimeline = transactionWrappers.map((tx) => ({
        title: tx.title,
        estimatedGas: 'Unknown gas',
        message: 'Waiting for Safe to confirm the transaction...',
        status: 'pending', // Initial status reflects that we're waiting for Safe confirmation.
      }));
    } else {
      transactionsTimeline = transactionWrappers.map((tx, index) => ({
        title: tx.title,
        estimatedGas: 'Unknown gas',
        message:
          index === 0
            ? 'Waiting for you to confirm the transaction in your wallet'
            : 'Waiting on previous transaction',
        status: index === 0 ? 'awaitingSignature' : 'awaitingPrevious',
      }));
    }
  }

  function getGasBuffer(gasLimit: number) {
    return Math.ceil(gasLimit * 1.25);
  }

  function toggleErrorDetails(index: number) {
    failedTxIndex = index;
    isErrorDetailsVisible = !isErrorDetailsVisible;
  }
</script>

<div class="transact-step">
  {#if transactionsTimeline.length}
    <!-- Header -->
    {#if icon}
      <div class="icon">
        <svelte:component this={icon.component} class="icon" {...icon.props} />
      </div>
    {/if}
    <StepHeader {headline} {description} />

    <!-- Timeline -->
    <div class="timeline">
      <h5>Transactions</h5>

      <!-- Tx "rows" -->
      {#each transactionsTimeline as transactionStatusItem, index}
        <div
          class="row"
          class:grayed={transactionStatusItem.status === 'awaitingPrevious' ||
            transactionStatusItem.status === 'cancelled'}
        >
          <!-- Index "column" -->
          <div
            class="index"
            class:index-grayed={transactionStatusItem.status === 'awaitingPrevious' ||
              transactionStatusItem.status === 'cancelled'}
            class:index-errored={transactionStatusItem.status === 'failed' ||
              transactionStatusItem.status === 'rejected'}
          >
            {index + 1}
          </div>

          <!-- Content "column" -->
          <div class="content">
            <!-- Title and action row -->
            <div class="title-and-action">
              <h3>{transactionStatusItem.title}</h3>

              {#if transactionStatusItem.status === 'pending' || transactionStatusItem.status === 'finalizing' || transactionStatusItem.status === 'retrying'}
                <div><Spinner /></div>
              {/if}

              {#if transactionStatusItem.status === 'confirmed'}
                <div class="button">
                  <Button
                    icon={ArrowBoxUpRight}
                    href={transactionStatusItem.etherscanUrl}
                    target="_blank"
                  >
                    View on Etherscan</Button
                  >
                </div>
              {:else if transactionStatusItem.status === 'failed' || transactionStatusItem.status === 'rejected' || (transactionStatusItem.status === 'retrying' && index === failedTxIndex)}
                <div class="button">
                  <Button
                    variant="primary"
                    disabled={isRetrying}
                    on:click={async () => await retryFailedTransaction()}>Try again</Button
                  >
                </div>
              {/if}
            </div>

            <!-- Status message row -->
            <div class="tx-info">
              {#if transactionStatusItem.status === 'awaitingSignature'}
                <div class="status">
                  <div class="wallet">
                    <Wallet style="fill: var(--color-primary);" />
                  </div>
                  <div>{transactionStatusItem.message}</div>
                </div>
              {:else if transactionStatusItem.status === 'failed'}
                <div class="status errored">
                  <ExclamationCircle style="fill: var(--color-negative); display: inline-block;" />
                  {transactionStatusItem.message}
                  <button style="margin-left: 0.5rem;" on:click={() => toggleErrorDetails(index)}>
                    <span class="button" style="text-decoration: underline;">
                      {failedTxIndex === index ? 'Show' : 'Hide'} error
                    </span>
                  </button>
                </div>
              {:else if transactionStatusItem.status === 'rejected'}
                <div class="status errored">
                  <CrossCircle style="fill: var(--color-negative); display: inline-block;" />
                  {transactionStatusItem.message}
                </div>
              {:else}
                <div class="status-message grayed">
                  {transactionStatusItem.message}
                </div>
              {/if}
            </div>

            <!-- Error details row -->
            {#if failedTxIndex === index && isErrorDetailsVisible}
              <div class="error-container">{error}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="loading-txs-spinner">
      <Spinner />
      <p>{duringBeforeMsg ?? 'Preparing transactions...'}</p>
    </div>
  {/if}

  <!-- Footer -->
  {#if transactionsTimeline.length}
    <div class:actions={isExecutionCompleted}>
      {#if isExecutionCompleted}
        <div>All transactions complete!</div>
        <Button
          icon={ArrowRight}
          variant="primary"
          on:click={() => dispatchResult('result', { success: true })}>Continue</Button
        >
      {:else}
        These transactions will trigger automatically. Not working? <button
          style="text-decoration: underline; cursor: pointer"
          on:click={() => dispatchStartOver('startOver')}>Try again</button
        >
      {/if}
    </div>
  {/if}
</div>

<style>
  .transact-step {
    gap: 1rem;
    display: flex;
    flex-direction: column;
  }

  .timeline {
    width: 100%;
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  .timeline > h5 {
    padding: 0.5rem;
    text-align: start;
    padding-left: 1.5rem;
    border-radius: 1.5rem 0rem 0 0;
    background-color: var(--color-foreground-level-1);
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .row {
    display: flex;
    position: relative;
    align-items: flex-start;
  }

  .index {
    font-weight: bold;
    display: flex;
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    position: relative;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    margin: calc(2rem + 4px) 1rem 0rem 2rem;
    border: 1px solid var(--color-foreground);
  }

  .index-errored {
    color: var(--color-negative);
    border-color: var(--color-negative);
  }

  .title-and-action {
    display: flex;
    margin-right: 2rem;
    margin-top: 2px;
    justify-content: space-between;
  }

  .title-and-action h3 {
    margin-left: 3px;
  }

  .row::before {
    width: 1px;
    content: '';
    height: 100%;
    position: absolute;
    top: calc(2rem + 4px);
    left: calc((2rem + 1.5rem / 2) - 1px);
    border: 1px dashed var(--color-foreground-level-4);
  }

  .row:last-child::before {
    content: none;
  }

  .row:last-child {
    margin-bottom: 2rem;
  }

  .error-container {
    padding: 1rem;
    max-width: 100%;
    margin-right: 2rem;
    margin-left: 3px;
    white-space: normal;
    word-wrap: break-word;
    flex-direction: column;
    color: var(--color-negative);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    border: 1px solid var(--color-negative);
    background-color: var(--color-negative-level-1);
  }

  .content {
    gap: 1rem;
    flex-grow: 1;
    display: flex;
    overflow: auto;
    text-align: start;
    flex-direction: column;
    margin: 2rem 0rem 0rem 1rem;
  }

  .status {
    display: flex;
    align-items: center;
  }

  .status .wallet {
    padding: 0.5rem;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: var(--color-primary-level-2);
  }

  .status-message {
    margin-left: 3px;
  }

  .errored {
    flex-wrap: wrap;
    color: var(--color-negative);
  }

  .index-errored {
    color: var(--color-negative);
    border-color: var(--color-negative);
  }

  .grayed {
    color: var(--color-foreground-level-5);
  }

  .index-grayed {
    color: var(--color-foreground-level-5);
    border-color: var(--color-foreground-level-5);
  }

  .loading-txs-spinner {
    gap: 1rem;
    display: flex;
    min-height: 16rem;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  .actions {
    gap: 1rem;
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .icon {
    margin: auto;
  }

  @media (max-width: 577px) {
    .title-and-action {
      gap: 0.5rem;
      flex-direction: column;
      align-items: flex-start;
    }

    .title-and-action h3 {
      width: 100%;
      margin-left: 0;
      margin-bottom: 0.5rem;
    }

    .title-and-action .button {
      width: 100%;
      margin-left: 0;
      text-align: left;
    }
  }
</style>

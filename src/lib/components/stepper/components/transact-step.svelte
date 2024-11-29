<script lang="ts">
  import { createEventDispatcher, onMount, type ComponentType } from 'svelte';
  import type {
    BeforeFunc,
    ExternalTransaction,
    SomeTransactPayload,
    TransactionWrapper,
    TransactionWrapperOrExternalTransaction,
    TransactPayload,
  } from '../types';
  import { get } from 'svelte/store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import unreachable from '$lib/utils/unreachable';
  import modal from '$lib/stores/modal';
  import SafeAppsSDK, { type SendTransactionsResponse } from '@safe-global/safe-apps-sdk';
  import type { TransactionReceipt, Signer } from 'ethers';
  import isTest from '$lib/utils/is-test';
  import type { Nullable } from 'vitest';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import type { Result } from './await-step.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { fade, slide } from 'svelte/transition';
  import TxLink from './tx-link.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import networkConfig from '$lib/stores/wallet/network';
  import type { ProgressFn } from '$lib/components/progress-bar/progress-bar.svelte';
  import predefinedDurationProgress from '$lib/components/progress-bar/predefined-duration-progress';
  import ProgressBar from '$lib/components/progress-bar/progress-bar.svelte';
  import expect from '$lib/utils/expect';
  import { Contract } from 'ethers';
  import { callerAbi } from '$lib/utils/sdk/caller/caller-abi';
  import Gas from '$lib/components/icons/Gas.svelte';
  import Logo from '$lib/components/illustrations/logo.svelte';

  const dispatchResult = createEventDispatcher<{ result: Result }>();
  const dispatchStartOver = createEventDispatcher<{ startOver: void }>();

  export let transactPayload: SomeTransactPayload;

  type TransactionWrapperWithGasLimit = TransactionWrapper & { gasLimit: number | undefined };

  type TransactionTimelineItem =
    | {
        external: false;
        title: string;
        message: string;
        txUrl?: string;
        gasless?: boolean;
        status:
          | 'awaitingPrevious'
          | 'awaitingSignature'
          | 'submittedToSafe'
          | 'pending'
          | 'confirmed'
          | 'failed'
          | 'cancelled'
          | 'rejected'
          | 'retrying'
          | 'finalizing';
      }
    | {
        external: true;
        message?: string;
        title: string;
        progressFn: ProgressFn;
        gasless?: boolean;
        status: 'awaitingPrevious' | 'pending' | 'failed' | 'confirmed';
      };

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

    const contractReceipts: TransactionReceipt[] = [];

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
        await afterSafe?.(safeSendTransactionResponse, beforeResult);
      } catch (e) {
        dispatchResult('result', { success: false, error: e as Error });
      }
    }

    isRetrying = false;
    isExecutionCompleted = true;
  }

  async function handleEoaTransactions(
    network: { chainId: number; name: string },
    address: string,
    transactionWrappers: TransactionWrapperOrExternalTransaction[],
    signer: Signer,
    contractReceipts: TransactionReceipt[],
    startIndex: number,
  ) {
    // If we are connected to an EOA wallet, we simply trigger all the transactions in sequence.

    const txWrappersWithGas: (TransactionWrapperWithGasLimit | ExternalTransaction)[] =
      transactionWrappers.map((txOrExternalTx) =>
        'transaction' in txOrExternalTx
          ? {
              ...txOrExternalTx,
              gasLimit: undefined,
            }
          : txOrExternalTx,
      );

    // If at least one of the transactions has `applyGasBuffer` set to `true`, we need to
    // simulate the entire batch. This is because the transactions may be inter-dependent,
    // meaning they cannot always be independently simulated.
    // In E2E tests, we can't simulate with Tenderly, so we don't.
    const needToSimulate =
      !isTest() &&
      networkConfig.applyGasBuffers &&
      txWrappersWithGas.some((tx) => 'transaction' in tx && tx.applyGasBuffer);

    if (needToSimulate) {
      try {
        const onlyNonExternalTransactions = txWrappersWithGas.filter((tx) => 'transaction' in tx);

        const simulationRes = await (
          await fetch('/api/tenderly/simulate', {
            method: 'POST',
            body: JSON.stringify({
              simulations: onlyNonExternalTransactions.map((tx) => ({
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

        onlyNonExternalTransactions.forEach((txWrapper, i) => {
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

      if ('external' in executingTx) {
        // It's an "external" tx, where we just have to wait for some arbitrary work to resolve. Once `progressFn` returns full progress, we move on.

        const executingTxStartMs = Date.now();

        updateTransactionTimelineStatus(executingTx, {
          external: true,
          status: 'pending',
          progressFn: () =>
            predefinedDurationProgress(
              executingTxStartMs,
              executingTx.expectedDurationMs,
              false,
              executingTx.expectedDurationText,
            ),
        });

        try {
          await executingTx.promise();

          updateTransactionTimelineStatus(executingTx, {
            external: true,
            status: 'confirmed',
            progressFn: () =>
              predefinedDurationProgress(
                executingTxStartMs,
                executingTx.expectedDurationMs,
                true,
                undefined,
              ),
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);

          updateTransactionTimelineStatus(executingTx, {
            status: 'failed',
            message: 'Failed',
          });

          error = e as Error;

          break;
        }

        continue;
      }

      try {
        updateTransactionTimelineStatus(executingTx, {
          status: 'awaitingSignature',
          message: 'Waiting for you to confirm in your wallet',
        });

        if (executingTx.gasless) {
          const domain = {
            name: 'Caller',
            version: '1',
            chainId: network.chainId,
            verifyingContract: networkConfig.contracts.CALLER,
          };

          const types = {
            CallSigned: [
              {
                name: 'sender',
                type: 'address',
              },
              {
                name: 'target',
                type: 'address',
              },
              {
                name: 'data',
                type: 'bytes',
              },
              {
                name: 'value',
                type: 'uint256',
              },
              {
                name: 'nonce',
                type: 'uint256',
              },
              {
                name: 'deadline',
                type: 'uint256',
              },
            ],
          };

          const { data, to } = executingTx.transaction;
          assert(data, 'Expected data to be defined');

          const { provider } = get(walletStore);
          const caller = new Contract(networkConfig.contracts.CALLER, callerAbi, provider);

          const nonce = await caller.nonce(address);

          const payload = {
            sender: address,
            target: to,
            data,
            value: 0,
            nonce: Number(nonce),
            // 1 hour in seconds
            deadline: Math.floor(Date.now() / 1000) + 3600,
          };

          const sig = await signer.signTypedData(domain, types, payload);

          updateTransactionTimelineStatus(executingTx, {
            status: 'pending',
            message: 'Submitting transaction',
          });

          const gaslessCallRes = await fetch('/api/gasless/call', {
            method: 'POST',
            body: JSON.stringify({
              targetContractAddress: to,
              callData: data,
              payload,
              eip712Signature: sig,
            }),
          });
          if (!gaslessCallRes.ok)
            throw new Error(`Failed to submit gasless call: ${await gaslessCallRes.text()}`);
          const body = await gaslessCallRes.json();
          const { taskId } = body;

          const gaslessCallExpectation = await expect(
            async () => {
              const res = await fetch(`/api/gasless/track/${taskId}`);
              if (!res.ok) throw new Error('Failed to track gasless owner update task');

              const { task } = await res.json();
              assert(typeof task === 'object', 'Invalid task');
              const { taskState, transactionHash } = task;
              assert(typeof taskState === 'string', 'Invalid task state');

              if (transactionHash) {
                updateTransactionTimelineStatus(executingTx, {
                  status: 'pending',
                  message: 'Waiting for confirmation',
                  txUrl: networkConfig.explorer.linkTemplate(transactionHash, network.name),
                });
              }

              return { taskState, task };
            },
            ({ taskState, task }) => {
              switch (taskState) {
                case 'ExecSuccess':
                  return true;
                case 'Cancelled':
                  throw new Error(`Gasless transaction failed: ${JSON.stringify(task)}`);
                default:
                  return false;
              }
            },
            600000,
            2000,
          );

          if (gaslessCallExpectation.failed) {
            throw new Error('The gasless call did not resolve within the expected timeframe.');
          }

          continue;
        }

        const txResponse = await (signer ?? unreachable()).sendTransaction({
          ...executingTx.transaction,
          gasLimit: executingTx.gasLimit ?? executingTx.transaction.gasLimit,
        });

        updateTransactionTimelineStatus(executingTx, {
          status: 'pending',
          message: 'Waiting for confirmation',
          txUrl: networkConfig.explorer.linkTemplate(txResponse.hash, network.name),
        });

        const receipt = await txResponse.wait();
        if (receipt) {
          contractReceipts.push(receipt);

          updateTransactionTimelineStatus(executingTx, {
            status: 'confirmed',
            message: 'Transaction confirmed',
            txUrl: networkConfig.explorer.linkTemplate(receipt.hash, network.name),
          });
        }
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

        failedTxIndex = i;

        break;
      }
    }
  }

  async function handleSafeAppTransactions(
    transactionWrappers: TransactionWrapperOrExternalTransaction[],
    network: { chainId: number },
    address: string,
  ) {
    // First, wait for any external transactions.

    const externalTransactions = transactionWrappers.filter((tx) => 'external' in tx);

    for (const executingTx of externalTransactions) {
      const executingTxStartMs = Date.now();

      updateTransactionTimelineStatus(executingTx, {
        external: true,
        status: 'pending',
        progressFn: () =>
          predefinedDurationProgress(
            executingTxStartMs,
            executingTx.expectedDurationMs,
            false,
            executingTx.expectedDurationText,
          ),
      });

      await executingTx.promise();

      updateTransactionTimelineStatus(executingTx, {
        external: true,
        status: 'confirmed',
        progressFn: () =>
          predefinedDurationProgress(
            executingTxStartMs,
            executingTx.expectedDurationMs,
            true,
            undefined,
          ),
      });
    }

    // Next, we batch together all the real transactions and propose them to the safe as one batch.

    const onlyNonExternalTransactions = transactionWrappers.filter((tx) => 'transaction' in tx);

    const safeAppsSdk = new SafeAppsSDK();

    let estimatedGasWithBuffer: number;
    try {
      const { estimatedGas } = await (
        await fetch('/api/tenderly/simulate', {
          method: 'POST',
          body: JSON.stringify({
            simulations: onlyNonExternalTransactions.map((tx) => ({
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

    const txs = onlyNonExternalTransactions.map(({ transaction: tx }) => ({
      to: tx.to ?? unreachable(),
      data: tx.data ?? unreachable(),
      value: '0',
    }));

    // In case of a batch transaction, we display the last TX in the batch to the user.
    const safeTx = transactionWrappers[transactionWrappers.length - 1];

    try {
      const response = await safeAppsSdk.txs.send({
        txs,
        params: {
          safeTxGas: estimatedGasWithBuffer,
        },
      });

      updateTransactionTimelineStatus(safeTx, {
        status: 'submittedToSafe',
        message: 'Transaction submitted to Safe',
      });

      return response;
    } catch (e) {
      const isRejection = (e as Error).message.toLowerCase().includes('user rejected transaction');

      if (isRejection) {
        updateTransactionTimelineStatus(safeTx, {
          status: 'rejected',
          message: 'You rejected the transaction',
        });
      } else {
        updateTransactionTimelineStatus(safeTx, {
          status: 'failed',
          message: 'Transaction failed',
        });

        error = e as Error;

        failedTxIndex = 0;
      }
    }
  }

  function recalculateTimelineStatuses(retryIndex: number) {
    error = undefined;
    isRetrying = false;
    failedTxIndex = -1;
    isErrorDetailsVisible = false;

    transactionsTimeline = transactionsTimeline.map((item, index) => {
      if (item.external) {
        return {
          ...item,
          status: 'awaitingPrevious',
        };
      }

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
    txWrapper: TransactionWrapperOrExternalTransaction,
    updates: Partial<TransactionTimelineItem>,
  ) {
    transactionsTimeline = transactionsTimeline.map((item) => {
      const isItemToUpdate = item.title === txWrapper.title;
      if (!isItemToUpdate) return item;

      // Technically unsafe type-cast here but we assume that the titles are unique,
      // so we could never accidentally update e.g. an external transaction timeline item
      // with data for a regular transaction timeline item.
      return {
        ...item,
        ...updates,
      } as TransactionTimelineItem;
    });
  }

  function initTransactionsTimelineItems(
    transactionWrappers: TransactionWrapperOrExternalTransaction[],
    isSafe: boolean,
  ) {
    if (isSafe) {
      // If there's multiple transactions that get proposed to a safe, they are batched.
      // The last transaction is the one that usually describes the ultimate outcome of
      // such a batch, so we display that one. But we do include any "external" transactions.
      // We presume here that external TXs happen at the beginning of the batch, because
      // anything other than that doesn't really make any sense in the context of a Safe.

      const externalTxs = transactionWrappers.filter((tx) => 'external' in tx);

      const lastTransaction = transactionWrappers[transactionWrappers.length - 1];

      transactionsTimeline = [
        ...externalTxs.map((etx) => ({
          external: true as const,
          title: etx.title,
          gasless: false,
          progressFn: () => ({
            progressFraction: 0,
            remainingText: 'Waiting on previous transaction',
          }),
          status: 'awaitingPrevious' as const,
        })),
        {
          external: false,
          gasless: false,
          title: lastTransaction.title,
          message: 'Waiting for you to submit the transaction in your Safe',
          status: externalTxs.length > 0 ? 'awaitingPrevious' : 'awaitingSignature',
        },
      ];
    } else {
      transactionsTimeline = transactionWrappers.map((tx, index) =>
        'external' in tx
          ? {
              external: true as const,
              title: tx.title,
              gasless: false,
              progressFn: () => ({
                progressFraction: 0,
                remainingText: 'Waiting on previous transaction',
              }),
              status: 'awaitingPrevious',
            }
          : {
              external: false,
              title: tx.title,
              gasless: tx.gasless,
              message:
                index === 0
                  ? 'Waiting for you to confirm the transaction in your wallet'
                  : 'Waiting on previous transaction',
              status: index === 0 ? 'awaitingSignature' : 'awaitingPrevious',
            },
      );
    }
  }

  function getGasBuffer(gasLimit: number) {
    return Math.ceil(gasLimit * 1.25);
  }

  function toggleErrorDetails(index: number) {
    failedTxIndex = index;
    isErrorDetailsVisible = !isErrorDetailsVisible;
  }

  onMount(() => {
    modal.setHideable(false);

    return () => {
      modal.setHideable(true);
    };
  });
</script>

<StepLayout>
  <div class="transact-step">
    <!-- Header -->
    {#if icon}
      <div class="icon">
        <svelte:component this={icon.component} class="icon" {...icon.props} />
      </div>
    {/if}
    <StepHeader {headline} {description} />

    <!-- Timeline -->
    <!-- <TransitionedHeight transitionHeightChanges> -->
    <div class="timeline">
      <h5>Transactions</h5>
      {#if transactionsTimeline.length === 0}
        <div class="loading-txs-spinner">
          <Spinner />
          <p>{duringBeforeMsg ?? 'Preparing transactions...'}</p>
        </div>
      {:else}
        <!-- Tx "rows" -->
        <div in:fade={{ duration: 300 }}>
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

                  {#if transactionStatusItem.external === false && (transactionStatusItem.status === 'pending' || transactionStatusItem.status === 'finalizing' || transactionStatusItem.status === 'retrying')}
                    <div><Spinner /></div>
                  {/if}

                  {#if (transactionStatusItem.external === false && transactionStatusItem.status === 'failed') || transactionStatusItem.status === 'rejected' || (transactionStatusItem.status === 'retrying' && index === failedTxIndex)}
                    <div class="button">
                      <Button
                        variant="primary"
                        disabled={isRetrying}
                        on:click={async () => await retryFailedTransaction()}>Try again</Button
                      >
                    </div>
                  {/if}
                </div>

                <!-- Gasless indicator -->
                {#if transactionStatusItem.gasless}
                  <div class="gasless-notice">
                    <Gas />
                    Gas fee $0.00
                    <div class="gasless-badge">
                      PAID FOR BY
                      <div class="logo-wrapper">
                        <Logo style="fill: var(--color-primary-level-6)" />
                      </div>
                    </div>
                  </div>
                {/if}

                <!-- Status message row -->
                <div class="tx-info typo-text">
                  {#if transactionStatusItem.status === 'awaitingSignature'}
                    <div class="status">
                      <div class="icon highlight">
                        <Wallet style="fill: var(--color-primary-level-6);" />
                      </div>
                      <div>{transactionStatusItem.message}</div>
                    </div>
                  {:else if transactionStatusItem.status === 'failed'}
                    <div class="status errored">
                      <div class="icon failure">
                        <ExclamationCircle style="fill: var(--color-negative)" />
                      </div>
                      {transactionStatusItem.message}
                      {#if transactionStatusItem.external === false}
                        <TxLink
                          explorerName={networkConfig.explorer.name}
                          url={transactionStatusItem.txUrl}
                        />
                      {/if}
                      <button
                        style="margin-left: 0.5rem;"
                        on:click={() => toggleErrorDetails(index)}
                      >
                        <span class="button" style="text-decoration: underline;">
                          {isErrorDetailsVisible ? 'Hide' : 'Show'} error
                        </span>
                      </button>
                    </div>
                  {:else if transactionStatusItem.status === 'rejected'}
                    <div class="status errored">
                      <div class="icon failure">
                        <CrossCircle style="fill: var(--color-negative)" />
                      </div>
                      {transactionStatusItem.message}
                    </div>
                  {:else if transactionStatusItem.external === false && transactionStatusItem.status === 'confirmed'}
                    <div class="status success">
                      <div class="icon success">
                        <CheckCircle style="fill: var(--color-positive-level-6)" />
                      </div>
                      {transactionStatusItem.message}
                      <TxLink
                        explorerName={networkConfig.explorer.name}
                        url={transactionStatusItem.txUrl}
                      />
                    </div>
                  {:else if transactionStatusItem.external === false}
                    <div class="status grayed">
                      {transactionStatusItem.message}
                      <TxLink
                        explorerName={networkConfig.explorer.name}
                        url={transactionStatusItem.txUrl}
                      />
                    </div>
                  {:else if transactionStatusItem.external === true}
                    <div out:slide={{ duration: 300 }}>
                      <ProgressBar progressFn={transactionStatusItem.progressFn} />
                    </div>
                  {/if}
                </div>

                <!-- Error details row -->
                {#if failedTxIndex === index && isErrorDetailsVisible}
                  <div class="error-container typo-text-mono">{error}</div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <!-- </TransitionedHeight> -->
  </div>
  <svelte:fragment slot="left-actions">
    <Button
      icon={ArrowLeft}
      variant="ghost"
      disabled={!!failedTxIndex}
      on:click={() => dispatchStartOver('startOver')}
    >
      Back
    </Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      icon={ArrowRight}
      variant="primary"
      disabled={!isExecutionCompleted}
      on:click={() => dispatchResult('result', { success: true })}
    >
      Continue
    </Button>
  </svelte:fragment>
</StepLayout>

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
    position: relative;
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
    margin: 2.375rem 1rem 0rem 2rem;
    border: 1px solid var(--color-foreground);
  }

  .index-errored {
    color: var(--color-negative);
    border-color: var(--color-negative);
  }

  .title-and-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 2.125rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .row::before {
    width: 1px;
    content: '';
    height: 100%;
    position: absolute;
    top: 2.5rem;
    left: calc((2rem + 1.5rem / 2) - 1px);
    border: 1px dashed var(--color-foreground-level-4);
  }

  .row:last-child::before {
    content: none;
  }

  .row:last-child .content {
    padding-bottom: 2rem;
  }

  .error-container {
    padding: 1rem;
    max-width: 100%;
    max-height: 11rem;
    overflow: scroll;
    white-space: normal;
    word-wrap: break-word;
    flex-direction: column;
    color: var(--color-negative);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    border: 1px solid var(--color-negative);
    background-color: var(--color-negative-level-1);
  }

  .content {
    gap: 0.25rem;
    overflow: auto;
    flex-grow: 1;
    display: flex;
    text-align: start;
    flex-direction: column;
    padding: 2rem 2rem 0rem 1rem;
  }

  .status {
    display: flex;
    align-items: center;
    min-height: 2rem;
    gap: 0.5rem;
  }

  .status .icon {
    border-radius: 50%;
    position: relative;
  }

  .status .icon.failure {
    animation: shake-head 1s;
  }

  .status .icon.highlight {
    background-color: var(--color-primary-level-1);
    animation: wiggle 1s;
    padding: 0.125rem;
    margin: -0.125rem 0 -0.125rem -0.125rem;
  }

  /* outline that grows from the round icon ever 1s */
  .icon.highlight::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: pulsing 2s infinite;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(5deg);
    }
    50% {
      transform: rotate(-5deg);
    }
    75% {
      transform: rotate(5deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes shake-head {
    0% {
      transform: translateX(0);
    }
    16.67% {
      transform: translateX(-0.125rem);
    }
    33.33% {
      transform: translateX(0.125rem);
    }
    50% {
      transform: translateX(-0.125rem);
    }
    66.67% {
      transform: translateX(0.125rem);
    }
    83.33% {
      transform: translateX(-0.125rem);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes pulsing {
    0% {
      box-shadow: 0 0 0 0px var(--color-primary-level-1);
    }
    50% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
  }

  .status.errored {
    flex-wrap: wrap;
    color: var(--color-negative);
  }

  .status.success {
    flex-wrap: wrap;
    color: var(--color-positive-level-6);
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
    min-height: 8.375rem;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  .gasless-notice {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground-level-5);
  }

  .logo-wrapper {
    display: flex;
    width: 2.9rem;
  }

  .gasless-badge {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
    height: 1.5rem;
  }

  @media (max-width: 577px) {
    .index {
      margin: calc(1rem + 4px) 0.5rem 0rem 1rem;
    }

    .content {
      padding: 1rem 1rem 0rem 1rem;
    }

    .row::before {
      left: calc((1rem + 1.5rem / 2) - 1px);
    }
  }
</style>

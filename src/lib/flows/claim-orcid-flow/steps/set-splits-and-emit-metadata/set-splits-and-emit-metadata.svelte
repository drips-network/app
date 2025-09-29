<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    makeTransactPayload,
    type StepComponentEvents,
    type TransactionWrapperOrExternalTransaction,
  } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-orcid-flow';
  import { gql } from 'graphql-request';
  import unreachable from '$lib/utils/unreachable';
  import query from '$lib/graphql/dripsQL';
  import type {
    CheckOrcidVerificationStatusQuery,
    CheckOrcidVerificationStatusQueryVariables,
    OrcidIsClaimedQuery,
    OrcidIsClaimedQueryVariables,
  } from './__generated__/gql.generated';
  import expect from '$lib/utils/expect';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import network from '$lib/stores/wallet/network';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import assert from '$lib/utils/assert';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { buildOrcidClaimingTxs } from '$lib/utils/orcids/build-orcid-claiming-txs';
  import OrcidTransactionService from '$lib/utils/orcids/OrcidTransactionService';
  import { populateCallerWriteTx } from '$lib/utils/sdk/caller/caller';
  import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  async function checkOrcidInExpectedStateForClaiming() {
    const checkOrcidVerificationStatusQuery = gql`
      query CheckOrcidVerificationStatus($orcid: String!, $chain: SupportedChain!) {
        orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
          chain
          owner {
            address
          }
          isClaimed
          areSplitsValid
        }
      }
    `;

    const res = await query<
      CheckOrcidVerificationStatusQuery,
      CheckOrcidVerificationStatusQueryVariables
    >(checkOrcidVerificationStatusQuery, {
      orcid: $context.claimableId,
      chain: network.gqlName,
    });

    const orcidAccount = res.orcidLinkedIdentityByOrcid;
    if (!orcidAccount) {
      return false;
    }

    return (
      orcidAccount.isClaimed &&
      orcidAccount.owner?.address.toLowerCase() === $walletStore.address?.toLowerCase()
    );
  }

  async function waitForOrcidOwnerUpdate(gasless: boolean) {
    if (gasless) {
      // First, wait for Gelato Relay to resolve the update task.
      const gaslessOwnerUpdateExpectation = await expect(
        async () => {
          const res = await fetch(`/api/gasless/track/${$context.gaslessOwnerUpdateTaskId}`);
          if (!res.ok) throw new Error('Failed to track gasless owner update task');

          const { task } = await res.json();
          assert(typeof task === 'object', 'Invalid task');
          const { taskState } = task;
          assert(typeof taskState === 'string', 'Invalid task state');

          return taskState;
        },
        (taskState) => {
          switch (taskState) {
            case 'ExecSuccess':
              return true;
            case 'Cancelled':
              throw new Error(
                'Failed to gaslessly update the repository owner on-chain. There may be a temporary issue with our Transaction Relay provider. Please try again later.',
              );
            default:
              return false;
          }
        },
        600000,
        2000,
      );

      if (gaslessOwnerUpdateExpectation.failed) {
        throw new Error(
          "The gasless owner update transaction didn't resolve in the expected timeframe. There may be an issue with our Transaction Relay provider. Please try again later, or disable gasless transactions in the Drips application settings.",
        );
      }
    }

    // Next, wait for the new owner to be indexed by our infra.
    const ownerIndexedExpectation = await expect(
      () => checkOrcidInExpectedStateForClaiming(),
      (response) => response,
      600000,
      2000,
    );

    if (ownerIndexedExpectation.failed) {
      throw new Error(
        'The new owner was not indexed in the expected timeframe. There may be a temporary issue with our oracle provider. Please try again later.',
      );
    }
  }

  async function generateOwnerUpdateTransactions(
    gasslessOwnerUpdateTaskId: string | undefined,
    orcid: string,
  ) {
    let transactions: TransactionWrapperOrExternalTransaction[] = [];
    let fakeProgressBarConfig: { expectedDurationMs: number; expectedDurationText: string };

    switch (network.chainId) {
      case 1: {
        fakeProgressBarConfig = {
          expectedDurationMs: 100000,
          expectedDurationText: 'Usually less than a minute',
        };
        break;
      }
      case 314: {
        fakeProgressBarConfig = {
          expectedDurationMs: 500000,
          expectedDurationText: 'Usually less than 5 minutes',
        };
        break;
      }
      default: {
        fakeProgressBarConfig = {
          expectedDurationMs: 100000,
          expectedDurationText: 'Usually less than a minute',
        };
      }
    }

    if (gasslessOwnerUpdateTaskId) {
      transactions.push({
        external: true,
        title: 'Finalizing verification...',
        ...fakeProgressBarConfig,
        promise: () => waitForOrcidOwnerUpdate(true),
      });
    } else {
      const ownerUpdateTx = await buildOrcidClaimingTxs(orcid);

      transactions.push(...ownerUpdateTx.txs, {
        external: true,
        title: 'Finalizing verification...',
        ...fakeProgressBarConfig,
        promise: () => waitForOrcidOwnerUpdate(false),
      });
    }

    return transactions;
  }

  onMount(() =>
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Claim your ORCID',

        before: async () => {
          const orcidTransactionService = await OrcidTransactionService.new();

          const setSplitsBatch = await orcidTransactionService.buildBatchTx($context);

          const tx = await populateCallerWriteTx({
            functionName: 'callBatched',
            args: [setSplitsBatch.map(txToCallerCall)],
          });

          // Check once if the ORCID is already in the expected state for the final claim TX,
          // and skip the step that waits for everything to be in the right state if so.
          // We already kick off the gasless owner update after the user confirms the funding.json step,
          // so it could be that everything already resolved by the time we get here.
          const orcidAlreadyReadyForClaimTx = await checkOrcidInExpectedStateForClaiming();

          return { tx, orcidAlreadyReadyForClaimTx };
        },

        messages: {
          duringBefore: 'Preparing to claim ORCID...',
        },

        // TODO: what do we do with this?
        transactions: async ({ tx, orcidAlreadyReadyForClaimTx }) => {
          const ownerUpdateTransactionSteps = orcidAlreadyReadyForClaimTx
            ? []
            : await generateOwnerUpdateTransactions(
                $context.gaslessOwnerUpdateTaskId,
                $context.claimableId,
              );

          const setSplitsAndMetadataTransactionStep = {
            transaction: tx,
            applyGasBuffer: false,
            title: 'Set ORCID splits and metadata',
          };

          return [...ownerUpdateTransactionSteps, setSplitsAndMetadataTransactionStep];
        },

        after: async () => {
          const orcidAccountId = $context.claimableAccount?.account.accountId ?? unreachable();

          const orcidClaimedQuery = gql`
            query OrcidIsClaimed($orcid: String!, $chain: SupportedChain!) {
              orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
                chain
                isClaimed
                areSplitsValid
              }
            }
          `;

          await expect(
            () =>
              query<OrcidIsClaimedQuery, OrcidIsClaimedQueryVariables>(orcidClaimedQuery, {
                orcid: $context.claimableId,
                chain: network.gqlName,
              }),
            (result) =>
              Boolean(
                result.orcidLinkedIdentityByOrcid &&
                  result.orcidLinkedIdentityByOrcid.isClaimed &&
                  result.orcidLinkedIdentityByOrcid.areSplitsValid,
              ),
            300000,
            2000,
          );

          // Invalidate cached ORCID page (if any). This should happen automatically, but without
          // awaiting it here in addition, there could be a race condition. Better safe than sorry!
          await invalidateAccountCache(orcidAccountId);
          await invalidateAll();
        },
      }),
    ),
  );
</script>

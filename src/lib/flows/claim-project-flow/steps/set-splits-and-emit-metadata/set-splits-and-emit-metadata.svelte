<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    makeTransactPayload,
    type StepComponentEvents,
    type TransactionWrapperOrExternalTransaction,
  } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { gql } from 'graphql-request';
  import unreachable from '$lib/utils/unreachable';
  import query from '$lib/graphql/dripsQL';
  import type {
    ProjectIsClaimedQuery,
    ProjectIsClaimedQueryVariables,
  } from './__generated__/gql.generated';
  import expect from '$lib/utils/expect';
  import isClaimed from '$lib/utils/project/is-claimed';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import { populateCallerWriteTx } from '$lib/utils/sdk/caller/caller';
  import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import type {
    CheckProjectVerificationStatusQuery,
    CheckProjectVerificationStatusQueryVariables,
  } from './__generated__/gql.generated';
  import assert from '$lib/utils/assert';
  import walletStore from '$lib/stores/wallet/wallet.store';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  $: projectAccountId = $context.project?.account.accountId ?? unreachable();

  async function checkProjectInExpectedStateForClaiming() {
    const checkProjectVerificationStatusQuery = gql`
      query CheckProjectVerificationStatus($projectId: ID!, $chains: [SupportedChain!]) {
        projectById(id: $projectId, chains: $chains) {
          chainData {
            ... on UnClaimedProjectData {
              chain
              owner {
                address
              }
              verificationStatus
            }
            ... on ClaimedProjectData {
              chain
              owner {
                address
              }
              verificationStatus
            }
          }
        }
      }
    `;

    const res = await query<
      CheckProjectVerificationStatusQuery,
      CheckProjectVerificationStatusQueryVariables
    >(checkProjectVerificationStatusQuery, {
      projectId: projectAccountId,
      chains: [network.gqlName],
    });

    if (!res.projectById?.chainData) return false;
    const projectChainData = filterCurrentChainData(res.projectById.chainData);

    return (
      (projectChainData.verificationStatus === 'PendingMetadata' ||
        projectChainData.verificationStatus === 'OwnerUpdated') &&
      projectChainData.owner.address.toLowerCase() === $walletStore.address?.toLowerCase()
    );
  }

  async function waitForGaslessOwnerUpdate() {
    // First, wait for Gelato Relay to resolve the update task.
    await expect(
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
              'Failed to gaslessly update the repository owner on-chain. Please reach out to us on Discord.',
            );
          default:
            return false;
        }
      },
      300000,
      2000,
    );

    // Next, wait for the new owner to be indexed by our infra.
    // The project will be either in `PendingMetadata` or `OwnerUpdated` state, at which point
    // it's ready for the final claim TX that sets splits and metadata.
    await expect(
      () => checkProjectInExpectedStateForClaiming(),
      (response) => response,
      300000,
      2000,
    );
  }

  onMount(() =>
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Claim your project',

        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const setSplitsAndEmitMetadataBatch = await gitProjectService.buildBatchTx($context);

          const tx = await populateCallerWriteTx({
            functionName: 'callBatched',
            args: [setSplitsAndEmitMetadataBatch.map(txToCallerCall)],
          });

          // Check once if the project is already in the expected state for the final claim TX,
          // and skip the step that waits for everything to be in the right state if so.
          // We already kick off the gasless owner update after the user confirms the funding.json step,
          // so it could be that everything already resolved by the time we get here.
          const projectAlreadyReadyForClaimTx = await checkProjectInExpectedStateForClaiming();

          return { tx, projectAlreadyReadyForClaimTx };
        },

        messages: {
          duringBefore: 'Preparing to claim project...',
        },

        transactions: ({ tx, projectAlreadyReadyForClaimTx }) => {
          let transactions: TransactionWrapperOrExternalTransaction[] = [];

          if (!projectAlreadyReadyForClaimTx && $context.gaslessOwnerUpdateTaskId) {
            // The gasless owner update is still in progress and we should display a (fake) progress bar for it.

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

            transactions.push({
              external: true,
              title: 'Finalizing verification...',
              ...fakeProgressBarConfig,
              promise: waitForGaslessOwnerUpdate,
            });
          }

          transactions.push({
            transaction: tx,
            applyGasBuffer: false,
            title: 'Set project splits and metadata',
          });

          return transactions;
        },

        after: async () => {
          const projectId = $context.project?.account.accountId ?? unreachable();

          const projectClaimedQuery = gql`
            query ProjectIsClaimed($id: ID!, $chains: [SupportedChain!]) {
              projectById(id: $id, chains: $chains) {
                chainData {
                  ... on ClaimedProjectData {
                    chain
                  }
                  ... on UnClaimedProjectData {
                    chain
                  }
                }
              }
            }
          `;

          await expect(
            () =>
              query<ProjectIsClaimedQuery, ProjectIsClaimedQueryVariables>(projectClaimedQuery, {
                id: projectId,
                chains: [network.gqlName],
              }),
            (result) =>
              Boolean(
                result.projectById &&
                  isClaimed(filterCurrentChainData(result.projectById.chainData)),
              ),
            300000,
            2000,
          );

          // Invalidate cached project page (if any). This should happen automatically, but without
          // awaiting it here in addition, there could be a race condition. Better safe than sorry!
          await invalidateAccountCache(projectId);
          await invalidateAll();
        },
      }),
    ),
  );
</script>

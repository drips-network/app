<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    makeTransactPayload,
    type StepComponentEvents,
    type TransactionWrapperOrExternalTransaction,
  } from '$lib/components/stepper/types';
  import { writable, type Writable } from 'svelte/store';
  import { type State } from '../../claim-orcid-flow';
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
  import { sdkManager } from '$lib/utils/sdk/sdk-manager';
  import type { ClaimOrcidParams } from '@drips-network/sdk';

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
    sdk: NonNullable<typeof sdkManager.sdk>,
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
      const progressContext: Writable<Parameters<NonNullable<ClaimOrcidParams['onProgress']>>[0]> =
        writable('claiming');
      const claimOrcidPromise = sdk.linkedIdentities.claimOrcid({
        orcidId: orcid,
        waitOptions: { timeoutMs: 120000, pollIntervalMs: 5000 },
        onProgress: (step) => {
          progressContext.set(step);
        },
      });

      transactions.push(
        {
          title: 'Request update of ORCID iD owner',
          external: true,
          ...fakeProgressBarConfig,
          promise: () => {
            return new Promise<void>((resolve) => {
              progressContext.subscribe((progress) => {
                if (progress === 'waiting') {
                  resolve();
                }
              });
            });
          },
        },
        {
          title: 'Finalizing verification...',
          external: true,
          ...fakeProgressBarConfig,
          promise: () => {
            return new Promise<void>((resolve) => {
              progressContext.subscribe((progress) => {
                if (progress === 'configuring') {
                  resolve();
                }
              });
            });
          },
        },
        {
          title: 'Set ORCID iD splits',
          external: true,
          ...fakeProgressBarConfig,
          promise: async () => {
            const result = await claimOrcidPromise;
            if (result.status !== 'complete') {
              const failure =
                (!result.claim.success && result.claim.error) ??
                (!result.ownership.success && result.ownership.error) ??
                (!result.splits.success && result.splits.error) ??
                new Error('ORCID claim incomplete.');
              throw failure;
            }
          },
        },
      );
    }

    return transactions;
  }

  onMount(() =>
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Claim your ORCID',
        messages: {
          duringBefore: 'Preparing to claim ORCID…',
          duringAfter: 'Waiting for ownership + splits…',
        },

        before: async () => {
          const sdk = sdkManager.sdk;
          if (!sdk) throw new Error('SDK not initialized');
          return { sdk };
        },

        transactions: ({ sdk }) => {
          return generateOwnerUpdateTransactions(
            sdk,
            $context.gaslessOwnerUpdateTaskId,
            $context.claimableId,
          );
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

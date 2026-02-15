<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    makeTransactPayload,
    type StepComponentEvents,
    type TransactionWrapperOrExternalTransaction,
  } from '$lib/components/stepper/types';
  import { type Writable } from 'svelte/store';
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
  import { invalidateAll } from '$app/navigation';
  import assert from '$lib/utils/assert';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { sdkManager } from '$lib/utils/sdk/sdk-manager';
  import {
    CallerERC2771Domain,
    CallSignedERC2771Types,
    getCallerNonce,
  } from '$lib/utils/sdk/caller/caller';
  import gaslessStore from '$lib/stores/gasless/gasless.store';
  import { orcidIdToSandoxOrcidId } from '$lib/utils/orcids/fetch-orcid';
  import {
    populateRepoDriverWriteTx,
    executeRepoDriverReadMethod,
  } from '$lib/utils/sdk/repo-driver/repo-driver';
  import getOwnAccountId from '$lib/utils/sdk/utils/get-own-account-id';
  import { hexlify, toUtf8Bytes } from 'ethers';

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
      orcid: orcidIdToSandoxOrcidId($context.claimableId),
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
    litOwnerUpdateSignature: State['litOwnerUpdateSignature'],
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

    if (litOwnerUpdateSignature) {
      const { sourceId, name, owner, timestamp, r, vs } = litOwnerUpdateSignature;

      const updateOwnerByLitTx = await populateRepoDriverWriteTx({
        functionName: 'updateOwnerByLit',
        args: [
          sourceId,
          name as `0x${string}`,
          owner as `0x${string}`,
          timestamp,
          r as `0x${string}`,
          vs as `0x${string}`,
        ],
      });

      transactions.push(
        {
          title: 'Update ORCID iD owner',
          transaction: updateOwnerByLitTx,
          applyGasBuffer: false,
        },
        {
          external: true,
          title: 'Finalizing verification...',
          ...fakeProgressBarConfig,
          promise: () => waitForOrcidOwnerUpdate(false),
        },
      );
    } else if (gasslessOwnerUpdateTaskId) {
      transactions.push({
        external: true,
        title: 'Finalizing verification...',
        ...fakeProgressBarConfig,
        promise: () => waitForOrcidOwnerUpdate(true),
      });
    } else {
      const { address } = $walletStore;
      assert(address, 'Wallet address is not defined');

      const { claimTx: claimOrcidTx } = await sdk.linkedIdentities.prepareClaimOrcid({
        orcidId: orcidIdToSandoxOrcidId(orcid),
      });

      transactions.push(
        {
          title: 'Request update of ORCID iD owner',
          ...fakeProgressBarConfig,
          transaction: claimOrcidTx,
          gasless: {
            nonceGetter: () => getCallerNonce(address),
            ERC2771Data: (nonce) => ({
              domain: CallerERC2771Domain,
              types: CallSignedERC2771Types,
              payload: {
                sender: $walletStore.address,
                target: claimOrcidTx.to,
                data: claimOrcidTx.data,
                value: '0',
                nonce,
                deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
              },
            }),
          },
          applyGasBuffer: false,
        },
        {
          title: 'Finalizing verification...',
          external: true,
          ...fakeProgressBarConfig,
          promise: () => waitForOrcidOwnerUpdate(false),
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

        transactions: async ({ sdk }) => {
          const txs = await generateOwnerUpdateTransactions(
            sdk,
            $context.gaslessOwnerUpdateTaskId,
            $context.claimableId,
            $context.litOwnerUpdateSignature,
          );

          let setSplitsTx;

          if ($context.litOwnerUpdateSignature) {
            // When Lit is enabled, the account ID is computed with the Lit sourceId
            // (e.g. 4 for orcidSandbox) and the plain ORCID name. The SDK's
            // prepareClaimOrcid always uses sourceId=2 with "sandbox-" prefix,
            // which produces a different account ID.
            const { sourceId } = $context.litOwnerUpdateSignature;
            const nameHex = hexlify(toUtf8Bytes($context.claimableId)) as `0x${string}`;

            const litAccountId = await executeRepoDriverReadMethod({
              functionName: 'calcAccountId',
              args: [sourceId, nameHex],
            });

            const ownAccountId = await getOwnAccountId();

            setSplitsTx = await populateRepoDriverWriteTx({
              functionName: 'setSplits',
              args: [litAccountId, [{ accountId: BigInt(ownAccountId), weight: 1_000_000 }]],
            });
          } else {
            ({ setSplitsTx } = await sdk.linkedIdentities.prepareClaimOrcid({
              orcidId: orcidIdToSandoxOrcidId($context.claimableId),
            }));
          }

          txs.push({
            title: 'Set ORCID iD splits',
            transaction: setSplitsTx,
            gasless: $gaslessStore
              ? {
                  nonceGetter: () => getCallerNonce($walletStore.address!),
                  ERC2771Data: (nonce) => ({
                    domain: CallerERC2771Domain,
                    types: CallSignedERC2771Types,
                    payload: {
                      sender: $walletStore.address,
                      target: setSplitsTx.to,
                      data: setSplitsTx.data,
                      value: '0',
                      nonce,
                      deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
                    },
                  }),
                }
              : undefined,
            applyGasBuffer: false,
          });

          return txs;
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
                orcid: orcidIdToSandoxOrcidId($context.claimableId),
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

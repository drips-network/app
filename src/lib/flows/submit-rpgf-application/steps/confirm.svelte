<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import gaslessStore from '$lib/stores/gasless/gasless.store';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import {
    applicationAttestationData,
    buildAttestApplicationTx,
    getNonce,
    pinApplicationAttestationData,
  } from '$lib/utils/rpgf/eas';
  import { submitApplication, updateApplication } from '$lib/utils/rpgf/rpgf';
  import { getUIDsFromAttestReceipt, ZERO_BYTES32 } from '@ethereum-attestation-service/eas-sdk';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import assert from '$lib/utils/assert';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import type {
    Application,
    ApplicationFormFields,
    CreateApplicationDto,
  } from '$lib/utils/rpgf/types/application';
  import { invalidate } from '$app/navigation';
  import { clearLocallyStoredApplication } from '../../../../routes/(pages)/app/(app)/rpgf/rounds/[slugOrId]/applications/new/locally-stored-application';

  export let context: Writable<{ applicationId: string | null }>;
  export let applicationData: CreateApplicationDto;
  export let formFields: ApplicationFormFields;
  export let roundId: string;
  export let roundSlug: string;
  export let roundName: string;
  export let userId: string;
  export let categoryName: string;

  export let isUpdateForApplication: Application | null;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function sendApplication(attestationUID?: string) {
    const application = await submitApplication(undefined, roundId, {
      ...applicationData,
      attestationUID,
    });

    $context.applicationId = application.id;
  }

  async function sendApplicationUpdate(attestationUID?: string) {
    assert(isUpdateForApplication, 'No application to update');

    await updateApplication(undefined, roundId, isUpdateForApplication.id, {
      ...applicationData,
      attestationUID,
    });

    $context.applicationId = isUpdateForApplication.id;
  }

  function handleWithAttest() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: isUpdateForApplication ? 'Update application' : 'Submit application',

        before: async () => {
          assert(network.retroFunding.enabled, 'Retro funding is not enabled');
          assert(
            network.retroFunding.attestationConfig.enabled,
            'Attestations are not enabled for retro funding',
          );

          const { connected, address, provider } = $walletStore;
          if (!connected) {
            throw new Error('Wallet not connected');
          }

          const ipfsHash = await pinApplicationAttestationData(
            applicationData,
            categoryName,
            roundName,
            formFields,
          );

          const attestationData = applicationAttestationData(ipfsHash, roundSlug);

          const attestTx = await buildAttestApplicationTx(address, attestationData);

          const { easAddress } = network.retroFunding.attestationConfig;

          const easConfig =
            network.retroFunding.enabled &&
            network.retroFunding.attestationConfig.enabled &&
            network.retroFunding.attestationConfig;
          assert(easConfig, 'EAS configuration is not available');

          return { attestTx, easAddress, easConfig, address, attestationData, provider };
        },

        transactions: ({ attestTx, easAddress, easConfig, address, attestationData, provider }) => [
          {
            transaction: attestTx,
            applyGasBuffer: false,
            title: 'Attest application',
            gasless: $gaslessStore
              ? {
                  nonceGetter: () => getNonce(provider, address),
                  ERC2771Data(nonce) {
                    return {
                      domain: {
                        name: 'EAS',
                        version: '1.3.0',
                        chainId: network.chainId,
                        verifyingContract: easAddress,
                      },
                      types: {
                        Attest: [
                          { name: 'attester', type: 'address' },
                          { name: 'schema', type: 'bytes32' },
                          { name: 'recipient', type: 'address' },
                          { name: 'expirationTime', type: 'uint64' },
                          { name: 'revocable', type: 'bool' },
                          { name: 'refUID', type: 'bytes32' },
                          { name: 'data', type: 'bytes' },
                          { name: 'value', type: 'uint256' },
                          { name: 'nonce', type: 'uint256' },
                          { name: 'deadline', type: 'uint64' },
                        ],
                      },
                      payload: {
                        attester: address,
                        schema: easConfig.applicationAttestationSchemaUID,
                        recipient: address,
                        expirationTime: 0,
                        revocable: false,
                        refUID: ZERO_BYTES32,
                        data: attestationData,
                        value: '0',
                        nonce,
                        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
                      },
                    };
                  },
                }
              : undefined,
          },
        ],

        after: async (receipts) => {
          const attestationReceipt = receipts[receipts.length - 1];
          const attestationUID = getUIDsFromAttestReceipt(attestationReceipt)[0];

          if (isUpdateForApplication) {
            await sendApplicationUpdate(attestationUID);
            await invalidate('rpgf:round:applications');
          } else {
            await sendApplication(attestationUID);

            clearLocallyStoredApplication(roundId, userId);
            await invalidate('rpgf:round:applications');
          }
        },
      }),
    );
  }

  function handleWithoutAttest() {
    dispatch('await', {
      promise: async () => {
        if (isUpdateForApplication) {
          await sendApplicationUpdate();
        } else {
          await sendApplication();
        }

        await invalidate('rpgf:round:applications');
        clearLocallyStoredApplication(roundId, userId);
      },
      message: 'Submitting application...',
    });
  }

  $: shouldAttest = network.retroFunding.enabled && network.retroFunding.attestationConfig.enabled;

  function handleConfirm() {
    if (shouldAttest) {
      handleWithAttest();
    } else {
      handleWithoutAttest();
    }
  }
</script>

<StepLayout>
  <StepHeader
    headline="{isUpdateForApplication ? 'Update' : 'Submit'} your application"
    emoji="🗳️"
  />
  <div class="description">
    <p>
      Once you've submitted your application, it'll be <span class="typo-text-bold"
        >reviewed by the round admins</span
      >. After submission, you can check on the status of your application anytime by connecting
      your wallet and visiting the round page.
    </p>

    <h5>How your data is handled</h5>
    <p>
      {#if shouldAttest}
        Applications are <span class="typo-text-bold"
          >attested on-chain using Ethereum Attestation Service (EAS)</span
        >. On the next screen, you'll sign a transaction that attests the
        <span class="typo-text-bold">public fields of your application</span>
        on-chain. Fields marked as private will not be included, but will be
        <span class="typo-text-bold"
          >stored by Drips and shared exclusively with the round admins</span
        >.
      {:else}
        Application fields marked as private will be <span class="typo-text-bold"
          >stored by Drips and only shared with the round admins</span
        >. All other fields will be <span class="typo-text-bold">publicly visible</span> on the round
        page once your application has been reviewed and approved by the round admins.
      {/if}
    </p>

    <p>
      Please refer to the <a class="typo-link" href="/legal/privacy" target="_blank"
        >Drips Privacy Policy</a
      > for further information.
    </p>
  </div>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Never mind</Button>
    <Button icon={shouldAttest ? Wallet : CheckCircle} on:click={handleConfirm} variant="primary">
      {#if shouldAttest}
        Confirm in wallet
      {:else}
        Submit application
      {/if}
    </Button>
  </svelte:fragment>
</StepLayout>

<style>
  .description {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    text-align: left;
  }

  .description h5 {
    margin-top: 1rem;
  }
</style>

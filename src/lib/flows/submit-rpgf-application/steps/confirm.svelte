<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { buildAttestApplicationTx } from '$lib/utils/rpgf/eas';
  import { submitApplication } from '$lib/utils/rpgf/rpgf';
  import type { CreateApplicationDto, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
  import { getUIDsFromAttestReceipt } from '@ethereum-attestation-service/eas-sdk';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let context: Writable<{ applicationId: string | null }>;
  export let applicationData: CreateApplicationDto;
  export let applicationFormat: WrappedRoundPublic['round']['applicationFormat'];
  export let roundSlug: string;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  function handleConfirm() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Submit application',

        before: async () => {
          const { signer, connected, address } = $walletStore;
          if (!connected) {
            throw new Error('Wallet not connected');
          }

          const tx = await buildAttestApplicationTx(
            signer,
            address,
            applicationData,
            applicationFormat,
            roundSlug,
          );

          return { attestTx: tx };
        },

        transactions: ({ attestTx }) => [
          {
            transaction: attestTx,
            applyGasBuffer: false,
            title: 'Attest application on-chain',
            gasless: network.gaslessClaimAndCollect,
          },
        ],

        after: async (receipts) => {
          const attestationUID = getUIDsFromAttestReceipt(receipts[0])[0];

          const application = await submitApplication(
            undefined,
            roundSlug,
            {
              ...applicationData,
              attestationUID,
            },
            applicationFormat,
          );

          $context.applicationId = application.id;
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    headline="Submit your application"
    description="When submitting your application, public fields will be attested on-chain. All fields marked as private will only be shared with the round's organizers."
    emoji="💦"
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Never mind</Button>
    <Button icon={Wallet} on:click={handleConfirm} variant="primary">Confirm in wallet</Button>
  </svelte:fragment>
</StepLayout>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher } from 'svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import assert from '$lib/utils/assert';
  import { goto } from '$app/navigation';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let votingRoundId: string;

  function submit() {
    dispatch('await', {
      promise: async (updateAwaitStep) => {
        const timestamp = new Date();

        const { signer, address } = $walletStore;
        assert(signer && address);

        const signature = await multiplayer.signDeleteVotingRound(
          timestamp,
          address,
          votingRoundId,
          signer,
        );

        updateAwaitStep({
          message: 'Deleting your voting round...',
        });

        await multiplayer.deleteVotingRound(signature, timestamp, address, votingRoundId);

        await invalidateAll();
        await goto('/app/drip-lists');
      },
      message: 'Waiting for you to confirm in your wallet... ',
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💀"
    headline="Delete voting round"
    description="Are you sure that you want to delete this voting round? You can't undo this."
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button on:click={() => submit()} variant="destructive" icon={Wallet}>Confirm in wallet</Button>
  </svelte:fragment>
</StepLayout>

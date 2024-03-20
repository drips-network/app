<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher } from 'svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import assert from '$lib/utils/assert';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor, {
    type Items,
    type Percentages,
  } from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let votingRoundId: string;

  let items: Items = {};
  let percentages: Percentages = {};

  function submit() {
    dispatch('await', {
      promise: async (updateAwaitStep) => {
        const voteReceivers = await multiplayer.mapListEditorStateToVoteReceivers(
          items,
          percentages,
        );

        const { signer, address } = $walletStore;
        assert(signer && address, 'Wallet not connected');

        const timestamp = new Date();

        updateAwaitStep({
          message: 'Waiting for you to confirm vote in your wallet...',
        });

        const signature = await multiplayer.signVote(
          signer,
          timestamp,
          address,
          votingRoundId,
          voteReceivers,
        );

        updateAwaitStep({
          message: 'Submitting vote...',
        });

        await multiplayer.vote(votingRoundId, {
          signature,
          date: timestamp,
          collaboratorAddress: address,
          receivers: voteReceivers,
        });
      },
      message: 'Getting ready... ',
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🗳️"
    headline="Cast your vote"
    description="Add recipients and rank them based on which ones you think are most important."
  />

  <FormField title="Recipients*">
    <!-- TODO: Allow Drip List items -->
    <ListEditor bind:items bind:percentages allowedItems={['eth-addresses', 'projects']} />
  </FormField>

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button on:click={() => submit()} variant="primary" icon={Wallet}>Confirm in wallet</Button>
  </svelte:fragment>
</StepLayout>

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
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './vote-flow-steps';
  import { invalidateAll } from '$app/navigation';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRound: VotingRound;

  let valid: boolean;

  function submit() {
    dispatch('await', {
      promise: async (updateAwaitStep) => {
        const voteReceivers = multiplayer.mapListEditorStateToVoteReceivers(
          $context.listEditorConfig.items,
          $context.listEditorConfig.weights,
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
          votingRound.id,
          voteReceivers,
        );

        updateAwaitStep({
          message: 'Submitting vote...',
        });

        await multiplayer.vote(votingRound.id, {
          signature,
          date: timestamp,
          collaboratorAddress: address,
          receivers: voteReceivers,
        });

        updateAwaitStep({
          message: 'Wrapping up...',
        });

        await invalidateAll();
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
    <ListEditor
      bind:valid
      bind:items={$context.listEditorConfig.items}
      bind:weights={$context.listEditorConfig.weights}
    />
  </FormField>

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button on:click={() => submit()} variant="primary" icon={Wallet} disabled={!valid}
      >Confirm in wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { Vote } from '$lib/utils/multiplayer/schemas';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './view-vote-flow-steps';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let vote: Vote;
</script>

<StepLayout>
  <StepHeader emoji="🗳️" />
  <div class="collaborator-info">
    <IdentityBadge address={vote.collaboratorAddress} size="medium" />
    <span class="typo-text">Vote details</span>
  </div>
  <ListEditor isEditable={false} {...$context.listEditorConfig} />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Close</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .collaborator-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-direction: column;
  }
</style>

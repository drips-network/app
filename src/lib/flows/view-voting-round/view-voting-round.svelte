<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import type { Writable } from 'svelte/store';
  import type { State } from './view-voting-round-flow-steps';
  import Splits from '$lib/components/splits/splits.svelte';
  import formatDate from '$lib/utils/format-date';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRound: VotingRound;
</script>

<StepLayout>
  <StepHeader
    emoji="🗳️"
    headline="Vote from {formatDate(new Date(votingRound.startsAt), 'dayAndYear')}"
    description="{votingRound.votes?.length} collaborators, {votingRound.result?.length} recipients"
  />
  <Splits draft list={$context.splits} />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Close</Button>
  </svelte:fragment>
</StepLayout>

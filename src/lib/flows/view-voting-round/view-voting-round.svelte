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
  import FormField from '$lib/components/form-field/form-field.svelte';
  import VotingRoundCollaborators from '$lib/components/drip-list-card/components/voting-round-collaborators.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRound: VotingRound;
</script>

<StepLayout>
  <StepHeader
    emoji="🗳️"
    headline="Vote from {formatDate(new Date(votingRound.startsAt), 'dayAndYear')}"
    description={!votingRound.privateVotes
      ? `${votingRound.votes?.length} collaborators, ${votingRound.result?.length} recipients`
      : undefined}
  />

  <Splits draft list={$context.splits} />

  <VotingRoundCollaborators noButtons {votingRound} />

  <FormField title="Voting started">
    <span class="typo-text">{formatDate(new Date(votingRound.startsAt), 'verbose')}</span>
  </FormField>

  <FormField title="Voting ended">
    <span class="typo-text">{formatDate(new Date(votingRound.endsAt), 'verbose')}</span>
  </FormField>

  {#if votingRound.linkedAt}
    <FormField title="List published at">
      <span class="typo-text">{formatDate(new Date(votingRound.linkedAt), 'verbose')}</span>
    </FormField>
  {/if}

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Close</Button>
  </svelte:fragment>
</StepLayout>

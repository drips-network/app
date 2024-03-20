<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { Vote } from '$lib/utils/multiplayer/schemas';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let vote: Vote;
</script>

<StepLayout>
  <StepHeader
    emoji="🗳️"
    headline="Vote view"
    description="This will display someone else's vote."
  />
  {JSON.stringify(vote)}
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Close</Button>
  </svelte:fragment>
</StepLayout>

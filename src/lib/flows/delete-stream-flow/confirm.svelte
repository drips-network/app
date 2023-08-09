<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { Stream } from '$lib/stores/streams/types';
  import { createEventDispatcher } from 'svelte';
  import deleteStream from './methods/delete-stream';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;

  function startDeleting() {
    deleteStream(dispatch, stream);
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💀"
    headline="Delete stream"
    description="Are you sure that you want to delete this stream? It will immediately stop streaming, and be irreversibly erased."
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
    <Button on:click={startDeleting} variant="destructive">Delete stream</Button>
  </svelte:fragment>
</StepLayout>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
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
  <FormField title="Stream">
    <div class="list-container">
      <ListSelect
        blockInteraction
        searchable={false}
        items={{
          '': {
            type: 'selectable',
            label: stream.name ?? 'Unnamed stream',
          },
        }}
      />
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
    <Button on:click={startDeleting} variant="destructive">Delete stream</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
  }
</style>

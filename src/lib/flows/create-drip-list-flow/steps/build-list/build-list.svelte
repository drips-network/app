<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import { page } from '$app/stores';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  const { searchParams } = $page.url;
  const urlToAdd = searchParams.get('urlToAdd') ?? undefined;

  let listValid = false;
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="What projects, individuals, organizations, or other Drip Lists would you like to support with your Drip List?"
>
  <FormField title="Recipients*">
    <ListEditor
      bind:percentages={$context.dripList.percentages}
      bind:items={$context.dripList.items}
      bind:valid={listValid}
      addOnMount={urlToAdd}
    />
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!listValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

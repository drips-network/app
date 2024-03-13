<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import { page } from '$app/stores';
  import DripListEditor from '$lib/components/drip-list-editor/drip-list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let canCancel = false;

  const { searchParams } = $page.url;
  const urlToAdd = searchParams.get('urlToAdd') ?? undefined;

  let isValid = false;
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="What projects, individuals, organizations, or other Drip Lists would you like to support with your Drip List?"
>
  <DripListEditor bind:isValid bind:dripList={$context.dripList} {urlToAdd} />
  <svelte:fragment slot="actions">
    {#if canCancel}
      <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    {/if}
    <Button
      disabled={!isValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

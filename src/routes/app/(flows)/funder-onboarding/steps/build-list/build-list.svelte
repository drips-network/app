<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../funder-onboarding-flow';
  import { page } from '$app/stores';
  import DripListEditor from '$lib/components/drip-list-editor/drip-list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  const { searchParams } = $page.url;
  const projectUrlToAdd = searchParams.get('projectToAdd') ?? undefined;

  let isValid = false;
</script>

<StandaloneFlowStepLayout
  description="What projects, individuals, or organizations would you like to support with your Drip List?"
>
  <DripListEditor
    bind:isValid
    bind:dripList={$context.dripList}
    showListFirst={true}
    {projectUrlToAdd}
  />
  <svelte:fragment slot="actions">
    <Button
      disabled={!isValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<script lang="ts">
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { slotsTemplate, state, steps } from './funder-onboarding-flow';
  import { onDestroy, onMount } from 'svelte';
  import StandaloneFlowSlots from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));

  let currentStepIndex = 0;

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

<HeadMeta title="Create Drip List" />

<StandaloneFlowStepHeader title="Create your Drip List">
  <DripList slot="illustration" />
</StandaloneFlowStepHeader>

<StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps()}
  minHeightPx={128}
/>

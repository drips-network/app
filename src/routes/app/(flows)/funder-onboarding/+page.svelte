<script lang="ts">
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { slotsTemplate, state, steps } from './steps/funder-onboarding-flow';
  import OneBalance from '$lib/components/illustrations/one-balance.svelte';
  import { onDestroy, onMount } from 'svelte';
  import StandaloneFlowSlots from '../components/standalone-flow-slots/standalone-flow-slots.svelte';

  onMount(() => (window.onbeforeunload = () => true));
  onDestroy(() => (window.onbeforeunload = null));

  let currentStepIndex = 0;

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

<StandaloneFlowStepHeader title="Create a Drip List">
  <OneBalance slot="illustration" />
</StandaloneFlowStepHeader>

<StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps()}
  minHeightPx={512}
/>

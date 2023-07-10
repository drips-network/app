<script lang="ts">
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { onDestroy, onMount } from 'svelte';
  import StandaloneFlowSlots from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';
  import { slotsTemplate, state, steps } from './claim-project-flow';
  import { browser } from '$app/environment';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));

  let currentStepIndex = 0;

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

<StandaloneFlowStepHeader title="Claim a GitHub project">
  <MultiChain slot="illustration" />
</StandaloneFlowStepHeader>

<StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps()}
  minHeightPx={512}
/>

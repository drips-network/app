<script lang="ts">
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { onDestroy, onMount } from 'svelte';
  import StandaloneFlowSlots from '../components/standalone-flow-slots/standalone-flow-slots.svelte';
  import { slotsTemplate, state, steps } from './claim-project-flow';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));

  let currentStepIndex = 0;

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

<HeadMeta title="Claim GitHub project" />

<StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

<div class="icon">
  <MultiChain strokeWidth={6} />
</div>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps()}
  minHeightPx={0}
/>

<style>
  .icon {
    margin: 1rem auto 0 auto;
    height: 5rem;
    width: 5rem;
  }
</style>

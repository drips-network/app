<script lang="ts">
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

<StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

<div class="icon">
  <DripList strokeWidth={6} />
</div>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps()}
  minHeightPx={128}
/>

<style>
  .icon {
    margin: 1.5rem auto 0 auto;
    height: 5rem;
    width: 5rem;
  }
</style>

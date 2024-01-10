<script lang="ts">
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';
  import { slotsTemplate, state, steps } from './claim-project-flow';

  export let skipWalletConnect = false;

  let currentStepIndex = 0;

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

{#if !skipWalletConnect}
  <StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />
{/if}

<div class="icon">
  <MultiChain strokeWidth={6} />
</div>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps(skipWalletConnect, true)}
  minHeightPx={0}
/>

<style>
  .icon {
    margin: 0 auto 0 auto;
    padding-top: 1.5rem;
    height: 5rem;
    width: 5rem;
  }
</style>

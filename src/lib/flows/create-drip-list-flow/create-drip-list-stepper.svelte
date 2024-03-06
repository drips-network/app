<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { slotsTemplate, state as createState, steps } from './create-drip-list-flow';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';

  export let skipWalletConnect = false;
  export let isModal = false;

  let currentStepIndex = 0;

  const state = createState();

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

{#if !skipWalletConnect}
  <StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />
{/if}

<div class="icon">
  <DripList strokeWidth={6} />
</div>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps(state, skipWalletConnect, isModal)}
  minHeightPx={128}
/>

<style>
  .icon {
    margin: 0 auto 0 auto;
    padding-top: 1.5rem;
    height: 5rem;
    width: 5rem;
  }
</style>

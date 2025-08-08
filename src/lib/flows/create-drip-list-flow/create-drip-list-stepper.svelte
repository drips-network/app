<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { slotsTemplate, state as createState, steps } from './create-drip-list-flow';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';

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

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps(state, skipWalletConnect, isModal)}
  minHeightPx={128}
/>

<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { slotsTemplate, flowState, steps } from './create-drip-list-flow';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';

  interface Props {
    skipWalletConnect?: boolean;
    isModal?: boolean;
    displaySlots?: boolean;
  }

  let { skipWalletConnect = false, isModal = false, displaySlots = false }: Props = $props();

  let currentStepIndex = $state(0);

  const myState = flowState();

  let slots = $derived(slotsTemplate($myState, currentStepIndex));

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }
</script>

{#if displaySlots}
  <StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />
{/if}

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => myState}
  steps={steps(myState, skipWalletConnect, isModal)}
  minHeightPx={128}
/>

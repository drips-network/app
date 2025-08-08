<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';
  import { slotsTemplate, state, steps } from './claim-project-flow';

  export let projectUrl: string | undefined = undefined;
  export let skipWalletConnect = false;
  export let skipNetworkSelection = false;
  export let linkToProjectPageOnSuccess = true;

  let currentStepIndex = skipNetworkSelection ? 1 : 0;

  const myState = state();

  $: slots = slotsTemplate($myState, currentStepIndex);

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
  context={() => myState}
  steps={steps(
    myState,
    skipWalletConnect,
    true,
    projectUrl,
    linkToProjectPageOnSuccess,
    skipNetworkSelection,
  )}
  minHeightPx={0}
/>

<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';
  import { slotsTemplate, flowState, steps } from './claim-project-flow';

  interface Props {
    projectUrl?: string | undefined;
    skipWalletConnect?: boolean;
    skipNetworkSelection?: boolean;
    linkToProjectPageOnSuccess?: boolean;
    displaySlots?: boolean;
  }

  let {
    projectUrl = undefined,
    skipWalletConnect = false,
    skipNetworkSelection = false,
    linkToProjectPageOnSuccess = true,
    displaySlots = false,
  }: Props = $props();

  let currentStepIndex = $state(skipNetworkSelection ? 1 : 0);

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

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));
</script>

<HeadMeta title="Claim GitHub project" />

<ClaimProjectStepper />

<!-- <StandaloneFlowSlots on:edit={handleSlotEdit} {slots} />

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
</style> -->

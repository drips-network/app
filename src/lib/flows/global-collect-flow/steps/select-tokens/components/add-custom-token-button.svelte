<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import type { createEventDispatcher } from 'svelte';

  export let dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>;
  export let tokenAddress: string;

  function triggerAddTokenSidestep() {
    dispatch('sidestep', addCustomTokenFlowSteps(tokenAddress));
  }
</script>

<Button variant="normal" on:click={triggerAddTokenSidestep}>Add as custom token</Button>

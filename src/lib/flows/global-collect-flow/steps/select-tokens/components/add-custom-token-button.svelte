<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import type { createEventDispatcher } from 'svelte';

  interface Props {
    dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>;
    tokenAddress: string;
  }

  let { dispatch, tokenAddress }: Props = $props();

  function triggerAddTokenSidestep() {
    dispatch('sidestep', addCustomTokenFlowSteps(tokenAddress));
  }
</script>

<Button variant="normal" onclick={triggerAddTokenSidestep}>Add as custom token</Button>

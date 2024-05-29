<script lang="ts">
  import Stepper from "$lib/components/stepper/stepper.svelte";
  import addCustomTokenFlowSteps from "$lib/flows/add-custom-token/add-custom-token-flow-steps";
  import modal from "$lib/stores/modal";

  function handleClick(e: MouseEvent) {
    modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress));
    e.stopImmediatePropagation();
  }

  export let tokenAddress: string;
</script>

<button on:click={handleClick}>Unknown token</button>

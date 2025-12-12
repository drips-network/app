<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { flowState, steps } from './create-drip-list-flow';

  interface Props {
    skipWalletConnect?: boolean;
    isModal?: boolean;
  }

  let { skipWalletConnect = false, isModal = false }: Props = $props();

  let currentStepIndex = $state(0);

  const myState = flowState();
</script>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => myState}
  steps={steps(myState, skipWalletConnect, isModal)}
  minHeightPx={128}
/>

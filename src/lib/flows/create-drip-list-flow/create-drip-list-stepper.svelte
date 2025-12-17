<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { flowState, steps } from './create-drip-list-flow';
  import type { BlueprintOrBlueprintError } from '../../../routes/api/list-blueprints/blueprintSchema';

  interface Props {
    skipWalletConnect?: boolean;
    isModal?: boolean;
    displaySlots?: boolean;
    blueprintOrBlueprintError: BlueprintOrBlueprintError | undefined;
  }

  let { skipWalletConnect = false, isModal = false, blueprintOrBlueprintError }: Props = $props();

  let currentStepIndex = $state(0);

  const myState = flowState();
</script>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => myState}
  steps={steps(myState, skipWalletConnect, isModal, blueprintOrBlueprintError)}
  minHeightPx={128}
/>

<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { flowState, steps } from './create-drip-list-flow';
  import { slotsTemplate, state as createState, steps } from './create-drip-list-flow';
  import StandaloneFlowSlots from '$lib/components/standalone-flow-slots/standalone-flow-slots.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';
  import type { Blueprint } from '../../../routes/api/list-blueprints/blueprintSchema';

  interface Props {
    skipWalletConnect?: boolean;
    isModal?: boolean;
    displaySlots?: boolean;
    blueprintOrBlueprintError:
      | {
          blueprintError: 'not-found' | 'unknown' | 'invalid' | undefined;
        }
      | {
          blueprint: Blueprint;
        }
      | undefined;
  }


  // export let skipWalletConnect = false;
  // export let isModal = false;
  // export let displaySlots = false;
  // export let blueprintOrBlueprintError:
  //   | {
  //       blueprintError: 'not-found' | 'unknown' | 'invalid' | undefined;
  //     }
  //   | {
  //       blueprint: Blueprint;
  //     }
  //   | undefined = undefined;

  let currentStepIndex = 0;

  const state = createState();

  $: slots = slotsTemplate($state, currentStepIndex);

  function handleSlotEdit(e: CustomEvent<{ stepIndex: number }>) {
    currentStepIndex = e.detail.stepIndex;
  }

  let { skipWalletConnect = false, isModal = false, displaySlots = false, blueprintOrBlueprintError }: Props = $props();

  let currentStepIndex = $state(0);

  const myState = flowState();
</script>

<Stepper
  bind:currentStepIndex
  on:stepChange={() => window.scrollTo({ top: 0 })}
  context={() => state}
  steps={steps(state, skipWalletConnect, isModal, blueprintOrBlueprintError)}
  minHeightPx={128}
/>

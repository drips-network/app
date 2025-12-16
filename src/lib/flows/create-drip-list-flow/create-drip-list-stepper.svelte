<script lang="ts">
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { flowState, steps } from './create-drip-list-flow';
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

  // let currentStepIndex = 0;

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

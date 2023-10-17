<script lang="ts">
  import TwoBigOptions from '$lib/components/two-big-options/two-big-options.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Pause from 'radicle-design-system/icons/Pause.svelte';
  import Transactions from 'radicle-design-system/icons/Transactions.svelte';
  import DripList from 'radicle-design-system/icons/DripList.svelte';
  import Coin from 'radicle-design-system/icons/Coin.svelte';
  import Sharrow from 'radicle-design-system/icons/Sharrow.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import ArrowRight from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../funder-onboarding-flow';
  import unreachable from '$lib/utils/unreachable';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: formValid = $context.selectedSupportOption !== undefined;

  function submit() {
    switch ($context.selectedSupportOption) {
      case 1: {
        dispatch('goForward');
        break;
      }
      case 2: {
        // Skip the support type selection step
        dispatch('goForward', { by: 2 });
        break;
      }
      case undefined: {
        unreachable();
      }
    }
  }
</script>

<StandaloneFlowStepLayout
  headline="Support your Drip List"
  description="How would you like to start funding your Drip List?"
>
  <TwoBigOptions
    bind:selected={$context.selectedSupportOption}
    option1={{
      emoji: '🫗',
      title: 'Continuous support',
      attributes: [
        {
          icon: TokenStreams,
          text: 'Stream any ERC-20 token.',
        },
        {
          icon: Pause,
          text: 'Pause or cancel anytime.',
        },
        {
          icon: Transactions,
          text: 'Add or withdraw funds anytime.',
        },
      ],
    }}
    option2={{
      emoji: '⏩',
      title: 'Support later',
      attributes: [
        {
          icon: DripList,
          text: 'Publish the list.',
        },
        {
          icon: Sharrow,
          text: 'Share for public funding.',
        },
        {
          icon: Coin,
          text: 'Stream funds to your list anytime.',
        },
      ],
    }}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" on:click={submit}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

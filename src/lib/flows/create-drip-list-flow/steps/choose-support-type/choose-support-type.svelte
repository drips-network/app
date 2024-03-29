<script lang="ts">
  import TwoBigOptions from '$lib/components/two-big-options/two-big-options.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Pause from '$lib/components/icons/Pause.svelte';
  import Transactions from '$lib/components/icons/Transactions.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import unreachable from '$lib/utils/unreachable';
  import Heart from '$lib/components/icons/Heart.svelte';

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

  function supportLater() {
    $context.selectedSupportOption = undefined;
    dispatch('goForward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Support your Drip List"
  description="How would you like to start supporting your Drip List? You can freely create streams or send further one-time donations anytime later."
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
      emoji: '💸',
      title: 'One-time donation',
      attributes: [
        {
          icon: Coin,
          text: 'Send any ERC-20 token.',
        },
        {
          icon: Heart,
          text: 'Donate more anytime.',
        },
      ],
    }}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button on:click={supportLater}>Support later</Button>
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" on:click={submit}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

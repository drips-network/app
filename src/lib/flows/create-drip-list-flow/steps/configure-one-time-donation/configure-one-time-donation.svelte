<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import OneTimeDonationEditor from '$lib/components/one-time-donation-editor/one-time-donation-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  let formValid: boolean = $state();
</script>

<StandaloneFlowStepLayout
  headline="One-time donation"
  description="Choose a token and how much you would like to donate."
>
  <!-- @migration-task: migrate this slot by hand, `left-actions` is an invalid identifier -->
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} onclick={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <OneTimeDonationEditor
    bind:formValid
    bind:selectedTokenAddress={$context.oneTimeDonationConfig.selectedTokenAddress}
    bind:amountInputValue={$context.oneTimeDonationConfig.amountInputValue}
    bind:topUpMax={$context.oneTimeDonationConfig.topUpMax}
    bind:amount={$context.oneTimeDonationConfig.amount}
  />
  {#snippet actions()}
  
      <Button
        disabled={!formValid}
        icon={Check}
        variant="primary"
        onclick={() => dispatch('goForward')}>Continue</Button
      >
    
  {/snippet}
</StandaloneFlowStepLayout>

<style>
</style>

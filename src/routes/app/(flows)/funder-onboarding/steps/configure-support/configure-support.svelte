<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../funder-onboarding-flow';
  import SupportStreamEditor from '$lib/components/support-stream-editor/support-stream-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;
</script>

<StandaloneFlowStepLayout
  headline="Continuous Support"
  description="Set up a stream to support the projects on your Drip List."
>
  <AnnotationBox type="info">
    <div class="support-type-explainer">
      <h4 class="typo-text-small-bold">Supporting with a stream</h4>
      <ul>
        <li>Stream a custom amount of any ERC-20 token</li>
        <li>Cancel, pause or edit the stream rate anytime</li>
        <li>Top up or withdraw tokens from your stream balance anytime</li>
      </ul>
    </div>
  </AnnotationBox>
  <SupportStreamEditor
    bind:formValid
    bind:streamRateValueParsed={$context.continuousSupportConfig.streamRateValueParsed}
    bind:topUpAmountValueParsed={$context.continuousSupportConfig.topUpAmountValueParsed}
    bind:selectedTokenAddress={$context.continuousSupportConfig.listSelected[0]}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .support-type-explainer h4 {
    margin-bottom: 0.5rem;
  }

  .support-type-explainer ul li {
    list-style-type: disc;
    list-style-position: inside;
  }
</style>

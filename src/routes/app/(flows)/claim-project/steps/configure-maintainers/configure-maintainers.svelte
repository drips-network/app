<script lang="ts">
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(async () => {
    if ($context.highLevelPercentages['maintainers'] === 0) {
      dispatch('goForward');
    }
  });

  let formValid: boolean;
</script>

<StandaloneFlowStepLayout
  headline="Split to your maintainers"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'maintainers'
  ]}% split to your project’s maintainers. You can change this later anytime."
>
  <ListEditor
    bind:selected={$context.maintainerSplits.selected}
    bind:percentages={$context.maintainerSplits.percentages}
    bind:items={$context.maintainerSplits.items}
    bind:valid={formValid}
    allowedItems="eth-addresses"
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

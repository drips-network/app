<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(async () => {
    if ($context.highLevelPercentages['maintainers'] === 0) {
      dispatch('goForward');
    }
  });

  let formValid: boolean;

  $: dependencyKeys = Object.keys($context.dependencySplits.items);
</script>

<StandaloneFlowStepLayout
  headline="Split to your maintainers"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'maintainers'
  ]}% split to your project’s maintainers. In total, you can add up to 200 maintainers and dependencies, and change this list later anytime."
>
  <ListEditor
    bind:percentages={$context.maintainerSplits.percentages}
    bind:items={$context.maintainerSplits.items}
    bind:valid={formValid}
    maxItems={200 - dependencyKeys.length}
    allowedItems={['eth-addresses']}
    blockedKeys={dependencyKeys}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
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

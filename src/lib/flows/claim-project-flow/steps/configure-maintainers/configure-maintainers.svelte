<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

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
    bind:weights={$context.maintainerSplits.weights}
    bind:items={$context.maintainerSplits.items}
    bind:valid={formValid}
    maxItems={200 - dependencyKeys.length}
    allowProjects={false}
    allowDripLists={false}
    blockedAccountIds={dependencyKeys}
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

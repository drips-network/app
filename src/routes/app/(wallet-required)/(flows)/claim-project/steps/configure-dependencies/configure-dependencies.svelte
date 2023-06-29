<script lang="ts">
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;
</script>

<StandaloneFlowStepLayout
  headline="Split to your dependencies"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'maintainers'
  ]}% split to your project’s dependencies. {$context.dependenciesAutoImported
    ? 'We’ve imported these projects from your package.json to give you a head start.'
    : ''}"
>
  <ListEditor
    bind:selected={$context.dependencySplits.selected}
    bind:percentages={$context.dependencySplits.percentages}
    bind:items={$context.dependencySplits.items}
    bind:valid={formValid}
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

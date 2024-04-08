<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  onMount(async () => {
    if ($context.highLevelPercentages['dependencies'] === 0) {
      dispatch('goForward');
    }
  });

  $: maintainerKeys = Object.keys($context.maintainerSplits.items);
</script>

<StandaloneFlowStepLayout
  headline="Split to your dependencies"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'dependencies'
  ]}% split to your project’s dependencies.{$context.dependenciesAutoImported
    ? $context.dependencySplits.items &&
      typeof $context.dependencySplits.items === 'object' &&
      Object.keys($context.dependencySplits.items).length
      ? ' We’ve imported these projects from your package.json to give you a head start.'
      : ''
    : ''} In total, you can add up to 200 maintainers and dependencies, and change this list later anytime."
>
  <!-- TODO: Prevent splitting to the same project we're trying to claim. -->
  <ListEditor
    bind:weights={$context.dependencySplits.weights}
    bind:items={$context.dependencySplits.items}
    bind:valid={formValid}
    blockedAccountIds={mapFilterUndefined(
      [$context.project?.account.accountId, ...maintainerKeys],
      (v) => v,
    )}
    maxItems={200 - maintainerKeys.length}
  />
  <svelte:fragment slot="left-actions">
    <Button
      icon={ArrowLeftIcon}
      on:click={() =>
        dispatch('goForward', {
          by: $context.highLevelPercentages['maintainers'] === 0 ? -2 : -1,
        })}>Back</Button
    >
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

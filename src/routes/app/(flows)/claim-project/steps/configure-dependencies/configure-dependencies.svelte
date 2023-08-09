<script lang="ts">
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor, { type ListItem } from '$lib/components/list-editor/list-editor.svelte';
  import projectItem from '$lib/components/list-editor/item-templates/project';
  import type { GitProject } from '$lib/utils/metadata/types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  onMount(async () => {
    if ($context.highLevelPercentages['dependencies'] === 0) {
      dispatch('goForward');
    }
    await fetchProjectDeps();
  });

  async function fetchProjectDeps() {
    try {
      if ($context.dependencySplits.itemsPromise) {
        const promises = ($context.dependencySplits.itemsPromise as Promise<GitProject>[]).map(
          (p) =>
            p.catch((error) => {
              // eslint-disable-next-line no-console
              console.log('💧 ~ Could not fetch project:', error);
              return undefined;
            }),
        );

        const depsGitProjects = mapFilterUndefined(await Promise.all(promises), (v) => v);

        let dependencySplits: { [key: string]: ListItem } = {};
        depsGitProjects.forEach((d) => {
          dependencySplits[d.source.url] = projectItem(d);
        });

        $context.dependencySplits.items = dependencySplits;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('💧 ~ Could not fetch project dependencies:', error);
    }
  }

  $: countOfMaintainerSplits = $context.maintainerSplits.selected.length;
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
    bind:selected={$context.dependencySplits.selected}
    bind:percentages={$context.dependencySplits.percentages}
    bind:items={$context.dependencySplits.items}
    bind:valid={formValid}
    blockedKeys={$context.maintainerSplits.selected}
    maxItems={200 - countOfMaintainerSplits}
    allowedItems={['eth-addresses', 'projects']}
  />
  <svelte:fragment slot="left-actions">
    <Button
      icon={ArrowLeftIcon}
      on:click={() =>
        dispatch('goForward', {
          by: $context.highLevelPercentages['maintainers'] === 0 ? -2 : -1,
        })}>Go back</Button
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

<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { State } from '../edit-project-splits-steps';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import ArrowRight from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  function nextStep() {
    // If high level split says 0% for dependencies, we skip the next step
    if ($context.highLevelPercentages.dependencies === 0) {
      dispatch('goForward', { by: 2 });
    } else {
      dispatch('goForward');
    }
  }
</script>

<StepLayout>
  <StepHeader
    headline="Edit your maintainer list"
    description="Decide which Ethereum addresses should receive the {$context.highLevelPercentages[
      'maintainers'
    ]}% you assigned to your project’s maintainers."
  />
  <ListEditor
    bind:selected={$context.maintainerSplits.selected}
    bind:percentages={$context.maintainerSplits.percentages}
    bind:items={$context.maintainerSplits.items}
    bind:valid={formValid}
    allowedItems="eth-addresses"
    blockedKeys={$context.dependencySplits.selected}
  />
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" on:click={nextStep}
      >Continue</Button
    >
  </svelte:fragment>
</StepLayout>

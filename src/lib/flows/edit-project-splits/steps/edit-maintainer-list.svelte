<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { State } from '../edit-project-splits-steps';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ListEditor from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';

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

  $: dependencyKeys = Object.keys($context.dependencySplits.items);
</script>

<StepLayout>
  <StepHeader
    headline="Edit your maintainer list"
    description="Decide which Ethereum addresses should receive the {$context.highLevelPercentages[
      'maintainers'
    ]}% you assigned to your project’s maintainers."
  />
  <ListEditor
    bind:percentages={$context.maintainerSplits.percentages}
    bind:items={$context.maintainerSplits.items}
    bind:valid={formValid}
    blockedKeys={dependencyKeys}
    maxItems={200 - dependencyKeys.length}
    allowedItems={['eth-addresses']}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" on:click={nextStep}
      >Continue</Button
    >
  </svelte:fragment>
</StepLayout>

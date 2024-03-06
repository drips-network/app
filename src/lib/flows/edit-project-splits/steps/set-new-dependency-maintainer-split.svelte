<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { State } from '../edit-project-splits-steps';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Splits from '$lib/components/icons/Splits.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  function nextStep() {
    // If high level split says 0% for maintainers, we skip the next step
    if ($context.highLevelPercentages.maintainers === 0) {
      dispatch('goForward', { by: 2 });
    } else {
      dispatch('goForward');
    }
  }
</script>

<StepLayout>
  <StepHeader
    headline="Split your funds"
    description="Decide how much of your funds you’d like to split with your maintainers and dependencies from now on. Youʼll be able to edit your maintainer
    and dependency lists in the next step."
  />
  <VisualPercentageEditor
    items={[
      {
        id: 'maintainers',
        label: 'Maintainers',
        overflowIcon: User,
      },
      {
        id: 'dependencies',
        label: 'Dependencies',
        overflowIcon: Splits,
      },
    ]}
    bind:percentages={$context.highLevelPercentages}
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button icon={ArrowRight} variant="primary" on:click={nextStep}>Continue</Button>
  </svelte:fragment>
</StepLayout>

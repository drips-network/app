<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import User from '$lib/components/icons/User.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import type { State } from '../../claim-project-flow';
  import type { Writable } from 'svelte/store';
  import Splits from '$lib/components/icons/Splits.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  const formValid = true;
</script>

<StandaloneFlowStepLayout
  headline="Split your funds"
  description="Decide how much of your claimable funds (and any future funds) you’d like to split with your maintainers and dependencies. You can change this later anytime."
>
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
  <div class="info-box">
    <InfoCircle style="fill: var(--color-foreground-level-6)" />
    <p class="typo-text-small">You’ll list your maintainers and dependencies in the next step.</p>
  </div>
  <!-- @migration-task: migrate this slot by hand, `left-actions` is an invalid identifier -->
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  {#snippet actions()}
  
      <Button
        disabled={!formValid}
        icon={ArrowRight}
        variant="primary"
        onclick={() => dispatch('goForward')}>Continue</Button
      >
    
  {/snippet}
</StandaloneFlowStepLayout>

<style>
  .info-box {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    color: var(--color-foreground-level-6);
  }
</style>

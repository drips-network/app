<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import ArrowRight from 'radicle-design-system/icons/ArrowRight.svelte';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import User from 'radicle-design-system/icons/User.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';
  import type { State } from '../../claim-project-flow';
  import type { Writable } from 'svelte/store';
  import Splits from 'radicle-design-system/icons/Splits.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  const formValid = true;
</script>

<StandaloneFlowStepLayout
  headline="Split your funds"
  description="Decide how much of your claimable funds (and any future funds) you’d like to split with your maintainers and dependencies. Any remainder will be donated to Drips."
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
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRight}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .info-box {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    color: var(--color-foreground-level-6);
  }
</style>

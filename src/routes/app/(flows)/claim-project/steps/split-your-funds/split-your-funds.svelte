<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import ArrowRight from 'radicle-design-system/icons/ArrowRight.svelte';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import User from 'radicle-design-system/icons/User.svelte';
  import Splits from '$lib/components/splits/splits.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  const formValid = true;

  let percentages = { maintainers: 50, dependencies: 45, drips: 5 };
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
      {
        id: 'drips',
        label: 'Drips',
        overflowIcon: DripsLogo,
      },
    ]}
    bind:percentages
  />
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

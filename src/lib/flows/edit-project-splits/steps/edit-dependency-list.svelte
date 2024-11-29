<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { State } from '../edit-project-splits-steps';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import CustodialWarning from '$lib/components/annotation-box/custodial-warning.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  $: maintainerKeys = Object.keys($context.maintainerSplits.items);
</script>

<StepLayout>
  <StepHeader
    headline="Edit your dependency list"
    description="Decide which GitHub projects, Ethereum addresses, and other Drip Lists should receive the {$context
      .highLevelPercentages['dependencies']}% you assigned to your project’s dependencies."
  />
  <CustodialWarning dismissableId="custodial-warning-project-splits" />
  <ListEditor
    bind:weights={$context.dependencySplits.weights}
    bind:items={$context.dependencySplits.items}
    bind:valid={formValid}
    blockedAccountIds={$context.projectAccountId
      ? [$context.projectAccountId, ...maintainerKeys]
      : maintainerKeys}
    maxItems={200 - maintainerKeys.length}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRight}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StepLayout>

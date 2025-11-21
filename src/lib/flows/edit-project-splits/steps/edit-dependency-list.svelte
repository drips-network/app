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
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import importFromCSVSteps, {
    DEFAULT_MAX_ENTRIES,
  } from '$lib/flows/import-from-csv/import-from-csv-steps';
  import {
    createAddItemFunction,
    createClearItemsFunction,
  } from '$lib/flows/import-from-csv/csv-import-helpers';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  let formValid = $state(false);

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import dependencies from CSV',
        description:
          'Your CSV file should be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address, GitHub repo URL, or Drip List URL. Maximum 200 recipients. Any previously configured recipients will be overwritten with the CSV contents.',
        addItem: createAddItemFunction(context, 'dependencySplits'),
        clearItems: createClearItemsFunction(context, 'dependencySplits'),
        blockedAccountIds: $context.projectAccountId
          ? [$context.projectAccountId, ...maintainerKeys]
          : maintainerKeys,
      }),
    );
  }

  function handleErrorDismissed() {
    context.update((c) => {
      c.recipientErrors = [];
      return c;
    });
  }

  function goBackward() {
    dispatch('goBackward');
    // dismiss any errors on this step, since they're shared
    // with the next step
    handleErrorDismissed();
  }

  let maintainerKeys = $derived(Object.keys($context.maintainerSplits.items));
</script>

<StepLayout>
  <StepHeader
    headline="Edit your dependency list"
    description="Decide which GitHub projects, Ethereum addresses, and other Drip Lists should receive the {$context
      .highLevelPercentages['dependencies']}% you assigned to your project’s dependencies."
  />
  <CustodialWarning dismissableId="custodial-warning-project-splits" />
  <FormField title="Dependencies*">
    <ListEditor
      bind:weights={$context.dependencySplits.weights}
      bind:items={$context.dependencySplits.items}
      bind:valid={formValid}
      bind:inputErrors={$context.recipientErrors}
      on:errorDismissed={handleErrorDismissed}
      blockedAccountIds={$context.projectAccountId
        ? [$context.projectAccountId, ...maintainerKeys]
        : maintainerKeys}
      maxItems={DEFAULT_MAX_ENTRIES - maintainerKeys.length}
    />
    {#snippet action()}
      <Button variant="ghost" icon={ArrowDown} onclick={handleImportCSV}>Import from CSV</Button>
    {/snippet}
  </FormField>

  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={goBackward}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button
      disabled={!formValid}
      icon={ArrowRight}
      variant="primary"
      onclick={() => dispatch('goForward')}>Continue</Button
    >
  {/snippet}
</StepLayout>

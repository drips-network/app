<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import { page } from '$app/state';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import {
    createAddItemFunction,
    createClearItemsFunction,
  } from '$lib/flows/import-from-csv/csv-import-helpers';
  import importFromCSVSteps from '$lib/flows/import-from-csv/import-from-csv-steps';
  import CustodialWarning from '$lib/components/annotation-box/custodial-warning.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  const { searchParams } = page.url;
  const urlToAdd = searchParams.get('urlToAdd') ?? undefined;

  let listValid = $state(false);

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import recipients from CSV',
        description:
          'Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address, GitHub repo URL, or Drip List URL. Maximum 200 recipients. Any previously configured recipients will be overwritten with the CSV contents.',
        addItem: createAddItemFunction(context, 'dripList'),
        clearItems: createClearItemsFunction(context, 'dripList'),
      }),
    );
  }

  function handleErrorDismissed() {
    context.update((c) => {
      c.recipientErrors = [];
      return c;
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="What projects, individuals, organizations, or other Drip Lists would you like to support with your Drip List?"
>
  <CustodialWarning dismissableId="custodial-warning-drip-list" />
  <FormField title="Recipients*">
    <ListEditor
      bind:weights={$context.dripList.weights}
      bind:items={$context.dripList.items}
      bind:inputErrors={$context.recipientErrors}
      bind:valid={listValid}
      on:errorDismissed={handleErrorDismissed}
      addOnMount={urlToAdd}
    />
    {#snippet action()}
      <Button variant="ghost" icon={ArrowDown} onclick={handleImportCSV}>Import from CSV</Button>
    {/snippet}
  </FormField>

  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button
      disabled={!listValid}
      icon={Check}
      variant="primary"
      onclick={() => dispatch('goForward')}>Continue</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>

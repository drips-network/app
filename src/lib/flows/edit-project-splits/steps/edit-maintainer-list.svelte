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
  import importFromCSVSteps, {
    DEFAULT_MAX_ENTRIES,
  } from '$lib/flows/import-from-csv/import-from-csv-steps';
  import {
    createAddItemFunction,
    createClearItemsFunction,
  } from '$lib/flows/import-from-csv/csv-import-helpers';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import type { AccountId } from '$lib/utils/common-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  let formValid = $state(false);

  function nextStep() {
    // If high level split says 0% for dependencies, we skip the next step
    if ($context.highLevelPercentages.dependencies === 0) {
      dispatch('goForward', { by: 2 });
    } else {
      dispatch('goForward');
    }

    // dismiss any errors on this step, since they're shared
    // with the next step
    handleErrorDismissed();
  }

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import maintainers from CSV',
        description:
          'Your CSV file should be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address or ENS name if supported by the network. Maximum 200 recipients. Any previously configured recipients will be overwritten with the CSV contents.',
        exampleTableData: mapFilterUndefined(
          [
            ['0xa404a9258A2240d6f2FDa871a7Fbd71bb6523570', 20],
            ['0x38493bA0F8a15D81985bF5438bc6f90C6C5418C1', 75],
            ['vitalik.eth', 5],
          ],
          (v) => v,
        ),
        allowProjects: false,
        allowDripLists: false,
        addItem: createAddItemFunction(context, 'maintainerSplits'),
        clearItems: createClearItemsFunction(context, 'maintainerSplits'),
        blockedAccountIds: dependencyKeys,
      }),
    );
  }

  function handleErrorDismissed() {
    context.update((c) => {
      c.recipientErrors = [];
      return c;
    });
  }

  let dependencyKeys = $derived(Object.keys($context.dependencySplits.items));
</script>

<StepLayout>
  <StepHeader
    headline="Edit your maintainer list"
    description="Decide which Ethereum addresses should receive the {$context.highLevelPercentages[
      'maintainers'
    ]}% you assigned to your project’s maintainers."
  />
  <CustodialWarning dismissableId="custodial-warning-project-splits" />
  <FormField title="Maintainers*">
    <ListEditor
      bind:weights={$context.maintainerSplits.weights}
      bind:items={$context.maintainerSplits.items}
      bind:valid={formValid}
      bind:inputErrors={$context.recipientErrors}
      on:errorDismissed={handleErrorDismissed}
      blockedAccountIds={dependencyKeys}
      maxItems={DEFAULT_MAX_ENTRIES - dependencyKeys.length}
      allowProjects={false}
      allowDripLists={false}
    />
    {#snippet action()}
      <Button variant="ghost" icon={ArrowDown} onclick={handleImportCSV}>Import from CSV</Button>
    {/snippet}
  </FormField>
  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" onclick={nextStep}
      >Continue</Button
    >
  {/snippet}
</StepLayout>

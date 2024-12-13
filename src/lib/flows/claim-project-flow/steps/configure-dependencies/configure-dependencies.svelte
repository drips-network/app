<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import CustodialWarning from '$lib/components/annotation-box/custodial-warning.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';
  import importFromCSVSteps, {
    WEIGHT_FACTOR,
  } from '$lib/flows/import-from-csv/import-from-csv-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  onMount(async () => {
    if ($context.highLevelPercentages['dependencies'] === 0) {
      dispatch('goForward');
    }
  });

  $: maintainerKeys = Object.keys($context.maintainerSplits.items);

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import dependencies from CSV',
        description:
          'Your CSV file should be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address, GitHub repo URL, or Drip List URL. Maximum 200 recipients. Any previously configured recipients will be overwritten with the CSV contents.',
        addItem(key: AccountId, item: ListEditorItem, weight: number | undefined) {
          context.update((c) => {
            c.dependencySplits.items = {
              ...c.dependencySplits.items,
              [key]: item,
            };

            if (weight) {
              c.dependencySplits.weights[key] = weight * WEIGHT_FACTOR;
            }

            return c;
          });
        },
        clearItems() {
          context.update((c) => {
            c.dependencySplits.items = {};
            c.dependencySplits.weights = {};
            return c;
          });
        },
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
  headline="Split to your dependencies"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'dependencies'
  ]}% split to your project’s dependencies.{$context.dependenciesAutoImported
    ? $context.dependencySplits.items &&
      typeof $context.dependencySplits.items === 'object' &&
      Object.keys($context.dependencySplits.items).length
      ? ' We’ve imported these projects from your package.json to give you a head start.'
      : ''
    : ''} In total, you can add up to 200 maintainers and dependencies, and change this list later anytime."
>
  <CustodialWarning dismissableId="custodial-warning-claim-project" />
  <!-- TODO: Prevent splitting to the same project we're trying to claim. -->
  <FormField title="Dependencies*">
    <ListEditor
      bind:weights={$context.dependencySplits.weights}
      bind:items={$context.dependencySplits.items}
      bind:valid={formValid}
      bind:inputErrors={$context.recipientErrors}
      on:errorDismissed={handleErrorDismissed}
      blockedAccountIds={mapFilterUndefined(
        [$context.project?.account.accountId, ...maintainerKeys],
        (v) => v,
      )}
      maxItems={200 - maintainerKeys.length}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button
      icon={ArrowLeftIcon}
      on:click={() =>
        dispatch('goForward', {
          by: $context.highLevelPercentages['maintainers'] === 0 ? -2 : -1,
        })}>Back</Button
    >
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

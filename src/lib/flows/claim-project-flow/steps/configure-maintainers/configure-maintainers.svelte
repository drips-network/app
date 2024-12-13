<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import CustodialWarning from '$lib/components/annotation-box/custodial-warning.svelte';
  import importFromCSVSteps, {
    WEIGHT_FACTOR,
  } from '$lib/flows/import-from-csv/import-from-csv-steps';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import network from '$lib/stores/wallet/network';
  import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  $: dependencyKeys = Object.keys($context.dependencySplits.items);

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
            network.ensSupported ? ['vitalik.eth', 5] : undefined,
          ],
          (v) => v,
        ),
        allowProjects: false,
        allowDripLists: false,
        addItem(key: AccountId, item: ListEditorItem, weight: number | undefined) {
          context.update((c) => {
            c.maintainerSplits.items = {
              ...c.maintainerSplits.items,
              [key]: item,
            };

            if (weight) {
              c.maintainerSplits.weights[key] = weight * WEIGHT_FACTOR;
            }

            return c;
          });
        },
        clearItems() {
          context.update((c) => {
            c.maintainerSplits.items = {};
            c.maintainerSplits.weights = {};
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
  headline="Split to your maintainers"
  description="Decide how you want to divide the {$context.highLevelPercentages[
    'maintainers'
  ]}% split to your project’s maintainers. In total, you can add up to 200 maintainers and dependencies, and change this list later anytime."
>
  <CustodialWarning dismissableId="custodial-warning-claim-project" />
  <FormField title="Maintainers*">
    <ListEditor
      bind:weights={$context.maintainerSplits.weights}
      bind:items={$context.maintainerSplits.items}
      bind:valid={formValid}
      bind:inputErrors={$context.recipientErrors}
      on:errorDismissed={handleErrorDismissed}
      maxItems={200 - dependencyKeys.length}
      allowProjects={false}
      allowDripLists={false}
      blockedAccountIds={dependencyKeys}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
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

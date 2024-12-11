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
    WEIGHT_FACTOR,
  } from '$lib/flows/import-from-csv/import-from-csv-steps';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let formValid: boolean;

  function nextStep() {
    // If high level split says 0% for dependencies, we skip the next step
    if ($context.highLevelPercentages.dependencies === 0) {
      dispatch('goForward', { by: 2 });
    } else {
      dispatch('goForward');
    }
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

  $: dependencyKeys = Object.keys($context.dependencySplits.items);
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
      blockedAccountIds={dependencyKeys}
      maxItems={200 - dependencyKeys.length}
      allowProjects={false}
      allowDripLists={false}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRight} variant="primary" on:click={nextStep}
      >Continue</Button
    >
  </svelte:fragment>
</StepLayout>

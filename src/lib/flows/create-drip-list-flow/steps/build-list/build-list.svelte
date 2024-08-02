<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import { page } from '$app/stores';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import importFromCSVSteps from '$lib/flows/import-from-csv/import-from-csv-steps';
  import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';

  const WEIGHT_FACTOR = 10_000;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  const { searchParams } = $page.url;
  const urlToAdd = searchParams.get('urlToAdd') ?? undefined;

  let listValid = false;

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import recipients from CSV',
        description:
          'Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address, GitHub repo URL, or Drip List URL.',
        addItem(key: AccountId, item: ListEditorItem, weight: number | undefined) {
          context.update((c) => {
            c.dripList.items = {
              ...c.dripList.items,
              [key]: item,
            };

            if (weight) {
              c.dripList.weights[key] = weight * WEIGHT_FACTOR;
            }

            return c;
          });
        },
        clearItems() {
          context.update((c) => {
            c.dripList.items = {};
            c.dripList.weights = {};
            return c;
          });
        },
      }),
    );
  }
</script>

<StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="What projects, individuals, organizations, or other Drip Lists would you like to support with your Drip List?"
>
  <FormField title="Recipients*">
    <ListEditor
      bind:weights={$context.dripList.weights}
      bind:items={$context.dripList.items}
      bind:inputErrors={$context.recipientErrors}
      bind:valid={listValid}
      addOnMount={urlToAdd}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!listValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

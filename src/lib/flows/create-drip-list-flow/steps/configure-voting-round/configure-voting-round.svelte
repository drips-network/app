<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import importFromCSVSteps from '$lib/flows/import-from-csv/import-from-csv-steps';
  import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';
  import { AddItemError } from '$lib/components/list-editor/errors';
  import { slide } from 'svelte/transition';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import network from '$lib/stores/wallet/network';
  import CustodialWarning from '$lib/components/annotation-box/custodial-warning.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let collaboratorsListValid = false;
  let restrictedRecipientsListValid = false;
  $: isValid =
    collaboratorsListValid &&
    $context.votingRoundConfig.votingEnds &&
    (!$context.votingRoundConfig.areRecipientsRestricted || restrictedRecipientsListValid);

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCSVSteps({
        headline: 'Import collaborators from CSV',
        description:
          'Your CSV file should simply be a list of collaborator wallet addresses. For example:',
        allowProjects: false,
        allowAddresses: true,
        allowDripLists: false,
        csvMaxEntries: 5000,
        csvHeaders: ['collaborator'],
        exampleTableData: mapFilterUndefined(
          [
            ['0xa404a9258A2240d6f2FDa871a7Fbd71bb6523570'],
            ['0x38493bA0F8a15D81985bF5438bc6f90C6C5418C1'],
            network.ensSupported ? ['vitalik.eth'] : undefined,
          ],
          (v) => v,
        ),
        exampleTableCaption:
          'Importing a new CSV will overwrite any previously configured recipients.',
        addItem(key: AccountId, item: ListEditorItem) {
          context.update((c) => {
            c.votingRoundConfig.collaborators = {
              ...c.votingRoundConfig.collaborators,
              [key]: item,
            };

            return c;
          });
        },
        clearItems() {
          context.update((c) => {
            c.votingRoundConfig.collaborators = {};
            return c;
          });
        },
        onItemsError(errors) {
          return new AddItemError(
            'Some of your imported collaborators',
            'error',
            'They won’t be included',
            errors,
          );
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
  headline="Collaborative list"
  description="Configure who should be able to vote on your list's recipients."
>
  <CustodialWarning dismissableId="custodial-drip-list" />
  <FormField title="Collaborators*">
    <ListEditor
      allowProjects={false}
      allowDripLists={false}
      bind:items={$context.votingRoundConfig.collaborators}
      bind:valid={collaboratorsListValid}
      bind:inputErrors={$context.recipientErrors}
      on:errorDismissed={handleErrorDismissed}
      weightsMode={false}
      maxItems={5000}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </FormField>

  <FormField
    title="Voting ends*"
    description="Choose the specific day and time this voting period should end. You and your collaborators will have until this time to suggest and vote on recipients."
  >
    <DateInput
      min={new Date()}
      bind:value={$context.votingRoundConfig.votingEnds}
      timePrecision="second"
    />
  </FormField>

  <FormField
    title="Hide collaborators"
    description="If you hide collaborators, only you as the publisher may see the list of collaborators and their votes. At the end of the voting period, only the vote's results will be made public."
  >
    <svelte:fragment slot="action">
      <Toggle bind:checked={$context.votingRoundConfig.areVotesPrivate} />
    </svelte:fragment>
  </FormField>

  <FormField
    title="Restrict to specific recipients"
    description="By default, any collaborator can suggest any recipient. Enable this to configure a list of ETH addresses, GitHub repos, or other Drip Lists that can be voted for."
  >
    <svelte:fragment slot="action">
      <Toggle bind:checked={$context.votingRoundConfig.areRecipientsRestricted} />
    </svelte:fragment>
    {#if $context.votingRoundConfig.areRecipientsRestricted}
      <div transition:slide={{ duration: 300 }}>
        <ListEditor
          allowAddresses={true}
          allowDripLists={true}
          allowProjects={true}
          weightsMode={false}
          bind:items={$context.votingRoundConfig.allowedRecipients}
          bind:valid={restrictedRecipientsListValid}
        />
      </div>
    {/if}
  </FormField>

  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!isValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

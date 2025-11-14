<!-- @migration-task Error while migrating Svelte code: can't migrate `let isValid = false;` to `$state` because there's a variable named state.
     Rename the variable and try again or migrate by hand. -->
<script lang="ts" context="module">
  export const EDIT_DRIP_LIST_STEP_DRIP_LIST_TO_ADD_FRAGMENT = gql`
    ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
    fragment EditDripListStepDripListToAdd on DripList {
      ...ListEditorDripList
      account {
        accountId
      }
    }
  `;

  export const EDIT_DRIP_LIST_STEP_PROJECT_TO_ADD_FRAGMENT = gql`
    ${LIST_EDITOR_PROJECT_FRAGMENT}
    fragment EditDripListStepProjectToAdd on Project {
      ...ListEditorProject
      account {
        accountId
      }
    }
  `;
</script>

<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import assert from '$lib/utils/assert';
  import DripListEditor from '$lib/components/drip-list-editor/drip-list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import { gql } from 'graphql-request';
  import type {
    EditDripListStepDripListToAddFragment,
    EditDripListStepProjectToAddFragment,
  } from './__generated__/gql.generated';
  import {
    LIST_EDITOR_DRIP_LIST_FRAGMENT,
    LIST_EDITOR_PROJECT_FRAGMENT,
    type Items,
  } from '$lib/components/list-editor/types';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import importFromCsvSteps from '$lib/flows/import-from-csv/import-from-csv-steps';
  import type { Weights } from '$lib/components/list-editor/types';
  import {
    createAddItemFunction,
    createClearItemsFunction,
  } from '$lib/flows/import-from-csv/csv-import-helpers';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import { invalidateAll } from '$app/navigation';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import { buildDripListUpdateTxs } from '$lib/utils/driplist/buildDripListUpdateTxs';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let state: Writable<{
    listEditorConfig: {
      items: Items;
      weights: Weights;
    };
    name: string;
    description: string | undefined;
    dripListAccountId: string | undefined;
    isVisible: boolean;
  }>;

  export let projectToAdd: EditDripListStepProjectToAddFragment | undefined = undefined;
  export let dripListToAdd: EditDripListStepDripListToAddFragment | undefined = undefined;

  if (projectToAdd) {
    $state.listEditorConfig.items[projectToAdd.account.accountId] = {
      type: 'project',
      project: projectToAdd,
    };
    $state.listEditorConfig.weights[projectToAdd.account.accountId] = 0;
  }

  if (dripListToAdd) {
    $state.listEditorConfig.items[dripListToAdd.account.accountId] = {
      type: 'drip-list',
      dripList: dripListToAdd,
    };
    $state.listEditorConfig.weights[dripListToAdd.account.accountId] = 0;
  }

  let isValid = false;

  // TODO: Auto-refresh UI when splits change
  function submit() {
    dispatch(
      'transact',
      makeTransactPayload({
        icon: {
          component: Emoji,
          props: { emoji: '✏️', size: 'huge' },
        },
        headline: 'Edit your Drip List',
        before: async () => {
          const listId = $state.dripListAccountId;
          assert(listId, 'Drip List account ID is not set');

          const updateResult = await buildDripListUpdateTxs({
            dripListAccountId: listId,
            name: $state.name,
            description: $state.description,
            isVisible: $state.isVisible,
            weights: $state.listEditorConfig.weights,
            items: $state.listEditorConfig.items,
          });

          return {
            txs: updateResult.txs,
            accountId: listId,
            ipfsHash: updateResult.ipfsHash,
          };
        },

        transactions: ({ txs }) => txs,

        after: async (_, { accountId, ipfsHash }) => {
          await waitForAccountMetadata(accountId, ipfsHash, 'dripList');
          await invalidateAccountCache(accountId);
          await invalidateAll();
        },
      }),
    );
  }

  function handleImportCSV() {
    dispatch(
      'sidestep',
      importFromCsvSteps({
        headline: 'Import recipients from CSV',
        description:
          'Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:',
        exampleTableCaption:
          'A recipient can be a wallet address, GitHub repo URL, or Drip List URL. Maximum 200 recipients. Any previously configured recipients will be overwritten with the CSV contents.',
        addItem: createAddItemFunction(state, 'listEditorConfig'),
        clearItems: createClearItemsFunction(state, 'listEditorConfig'),
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="✏️"
    headline="Edit your Drip List"
    description="Choose which GitHub projects and Ethereum addresses you'd like to support with this Drip List."
  />
  <DripListEditor
    bind:isValid
    bind:name={$state.name}
    bind:description={$state.description}
    bind:weights={$state.listEditorConfig.weights}
    bind:items={$state.listEditorConfig.items}
    bind:isVisible={$state.isVisible}
  >
    <svelte:fragment slot="list-editor-action">
      <Button variant="ghost" icon={ArrowDown} onclick={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </DripListEditor>
  <svelte:fragment slot="actions">
    <Button onclick={modal.hide} variant="ghost">Cancel</Button>
    <Button onclick={submit} disabled={!isValid} icon={Wallet} variant="primary"
      >Confirm changes</Button
    >
  </svelte:fragment>
</StepLayout>

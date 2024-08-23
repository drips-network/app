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
      ... on ClaimedProject {
        account {
          accountId
        }
      }
      ... on UnclaimedProject {
        account {
          accountId
        }
      }
    }
  `;
</script>

<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import {
    getCallerClient,
    getNFTDriverClient,
    getNFTDriverTxFactory,
  } from '$lib/utils/get-drips-clients';
  import modal from '$lib/stores/modal';
  import NftDriverMetadataManager from '$lib/utils/metadata/NftDriverMetadataManager';
  import DripListService from '$lib/utils/driplist/DripListService';
  import assert from '$lib/utils/assert';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import { constants, Utils } from 'radicle-drips';
  import type { nftDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
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
  import type { ListEditorItem, AccountId, Weights } from '$lib/components/list-editor/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let state: Writable<{
    listEditorConfig: {
      items: Items;
      weights: Weights;
    };
    name: string;
    description: string | undefined;
    dripListAccountId: string | undefined;
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
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const nftDriverTxFactory = await getNFTDriverTxFactory();
          const dripListService = await DripListService.new();

          const { receivers, projectsSplitMetadata } =
            await dripListService.getProjectsSplitMetadataAndReceivers(
              $state.listEditorConfig.weights,
              $state.listEditorConfig.items,
            );

          const listId = $state.dripListAccountId;
          assert(listId, 'Drip List account ID is not set');

          const setSplitsTx = await nftDriverTxFactory.setSplits(listId, receivers);

          const nftDriverClient = await getNFTDriverClient();
          const metadataManager = new NftDriverMetadataManager(nftDriverClient);

          const currentMetadata = await metadataManager.fetchAccountMetadata(listId);
          assert(currentMetadata);

          const newMetadata: ReturnType<typeof nftDriverAccountMetadataParser.parseLatest> = {
            ...currentMetadata.data,
            name: $state.name,
            description: $state.description,
            projects: projectsSplitMetadata,
          };

          const hash = await metadataManager.pinAccountMetadata(newMetadata);

          const metadataTx = await nftDriverTxFactory.emitAccountMetadata(
            listId,
            [
              {
                key: MetadataManagerBase.USER_METADATA_KEY,
                value: hash,
              },
            ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value)),
          );

          const callerClient = await getCallerClient();
          const tx = await callerClient.populateCallBatchedTx([setSplitsTx, metadataTx]);

          return { tx };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: false,
          },
        ],
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
        addItem(key: AccountId, item: ListEditorItem, weight: number | undefined) {
          $state.listEditorConfig.items = {
            ...$state.listEditorConfig.items,
            [key]: item,
          };

          if (weight) {
            $state.listEditorConfig.weights[key] = (weight * constants.TOTAL_SPLITS_WEIGHT) / 100;
          }
        },
        clearItems() {
          $state.listEditorConfig = {
            items: {},
            weights: {},
          };
        },
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
  >
    <svelte:fragment slot="list-editor-action">
      <Button variant="ghost" icon={ArrowDown} on:click={handleImportCSV}>Import from CSV</Button>
    </svelte:fragment>
  </DripListEditor>
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Cancel</Button>
    <Button on:click={submit} disabled={!isValid} icon={Wallet} variant="primary"
      >Confirm changes</Button
    >
  </svelte:fragment>
</StepLayout>

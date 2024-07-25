<script lang="ts" context="module">
  export const EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT = gql`
    ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
    ${LIST_EDITOR_PROJECT_FRAGMENT}
    fragment EditDripListStepSelectedDripList on DripList {
      name
      description
      account {
        accountId
      }
      splits {
        ... on DripListReceiver {
          weight
          account {
            accountId
          }
          dripList {
            ...ListEditorDripList
          }
        }
        ... on AddressReceiver {
          weight
          account {
            address
            accountId
          }
        }
        ... on ProjectReceiver {
          weight
          account {
            accountId
          }
          project {
            ...ListEditorProject
          }
        }
      }
    }
  `;

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
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
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
  import { Utils } from 'radicle-drips';
  import type { nftDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
  import DripListEditor, {
    type DripListConfig,
  } from '$lib/components/drip-list-editor/drip-list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import { gql } from 'graphql-request';
  import type {
    EditDripListStepDripListToAddFragment,
    EditDripListStepProjectToAddFragment,
    EditDripListStepSelectedDripListFragment,
  } from './__generated__/gql.generated';
  import {
    LIST_EDITOR_DRIP_LIST_FRAGMENT,
    LIST_EDITOR_PROJECT_FRAGMENT,
    type Items,
  } from '$lib/components/list-editor/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  /** selectedDripListState must be fully populated before mounting this component */
  export let selectedDripListState: Writable<{
    dripList: EditDripListStepSelectedDripListFragment | undefined;
  }>;

  export let projectToAdd: EditDripListStepProjectToAddFragment | undefined = undefined;
  export let dripListToAdd: EditDripListStepDripListToAddFragment | undefined = undefined;

  let items: Items = Object.fromEntries(
    mapFilterUndefined($selectedDripListState.dripList?.splits ?? unreachable(), (rs) => {
      switch (rs.__typename) {
        case 'AddressReceiver':
          return [rs.account.accountId, { type: 'address', address: rs.account.address }];
        case 'ProjectReceiver':
          return [rs.account.accountId, { type: 'project', project: rs.project }];
        case 'DripListReceiver':
          return [rs.account.accountId, { type: 'drip-list', dripList: rs.dripList }];
      }
    }),
  );

  let weights = Object.fromEntries(
    mapFilterUndefined($selectedDripListState.dripList?.splits ?? unreachable(), (rs) => {
      return [rs.account.accountId, rs.weight];
    }),
  );

  if (projectToAdd) {
    items[projectToAdd.account.accountId] = { type: 'project', project: projectToAdd };
    weights[projectToAdd.account.accountId] = 0;
  }

  if (dripListToAdd) {
    items[dripListToAdd.account.accountId] = { type: 'drip-list', dripList: dripListToAdd };
    weights[dripListToAdd.account.accountId] = 0;
  }

  let dripList: DripListConfig = {
    items,
    weights,
    title: $selectedDripListState.dripList?.name ?? '',
    description: $selectedDripListState.dripList?.description ?? undefined,
  };

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
              dripList.weights,
              dripList.items,
            );

          const listId = $selectedDripListState.dripList?.account.accountId ?? unreachable();

          const setSplitsTx = await nftDriverTxFactory.setSplits(listId, receivers);

          const nftDriverClient = await getNFTDriverClient();
          const metadataManager = new NftDriverMetadataManager(nftDriverClient);

          const currentMetadata = await metadataManager.fetchAccountMetadata(listId);
          assert(currentMetadata);

          const newMetadata: ReturnType<typeof nftDriverAccountMetadataParser.parseLatest> = {
            ...currentMetadata.data,
            name: dripList.title,
            description: dripList.description,
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
</script>

<StepLayout>
  <StepHeader
    emoji="✏️"
    headline="Edit your Drip List"
    description="Choose which GitHub projects and Ethereum addresses you'd like to support with this Drip List."
  />
  <DripListEditor bind:isValid bind:dripList />
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Cancel</Button>
    <Button on:click={submit} disabled={!isValid} icon={Wallet} variant="primary"
      >Confirm changes</Button
    >
  </svelte:fragment>
</StepLayout>

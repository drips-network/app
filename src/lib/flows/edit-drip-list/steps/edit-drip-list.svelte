<script lang="ts">
  import type { Splits, Split } from '$lib/components/splits/splits.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getCallerClient, getNFTDriverTxFactory } from '$lib/utils/get-drips-clients';
  import type { GitProject } from '$lib/utils/metadata/types';
  import modal from '$lib/stores/modal';
  import NftDriverMetadataManager from '$lib/utils/metadata/NftDriverMetadataManager';
  import DripListService from '$lib/utils/driplist/DripListService';
  import type { z } from 'zod';
  import type { nftDriverAccountMetadataSchema } from '$lib/utils/metadata/schemas';
  import assert from '$lib/utils/assert';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import { Utils } from 'radicle-drips';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import projectItem from '$lib/components/list-editor/item-templates/project';
  import ethAddressItem from '$lib/components/list-editor/item-templates/eth-address';
  import dripListItem from '$lib/components/list-editor/item-templates/drip-list';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripListId: string;
  export let representationalSplits: Splits;
  export let projectToAdd: GitProject | undefined = undefined;
  export let listName: string;

  // TODO: Ensure these values are saved in case there's some TX error.

  function flattenRepresentationalSplits(list: Splits): Split[] {
    return list.reduce<Split[]>((acc, i) => {
      if (i.type === 'split-group') {
        return [...acc, ...flattenRepresentationalSplits(i.list)];
      }
      return [...acc, i];
    }, []);
  }

  let items = Object.fromEntries(
    mapFilterUndefined(flattenRepresentationalSplits(representationalSplits), (rs) => {
      if (rs.type === 'project-split') {
        return [rs.project.source.url, projectItem(rs.project)];
      } else if (rs.type === 'address-split') {
        return [rs.address, ethAddressItem(rs.address)];
      } else if (rs.type === 'drip-list-split') {
        return [rs.listId, dripListItem(rs.listName, rs.listId, rs.listOwner)];
      } else {
        return undefined;
      }
    }),
  );

  const MAX_SPLITS_WEIGHT = 1000000;

  function getSplitPercent(weight: number) {
    return ((weight * MAX_SPLITS_WEIGHT) / MAX_SPLITS_WEIGHT / MAX_SPLITS_WEIGHT) * 100;
  }

  let percentages = Object.fromEntries(
    mapFilterUndefined(flattenRepresentationalSplits(representationalSplits), (rs) => {
      if (rs.type === 'project-split') {
        return [rs.project.source.url, getSplitPercent(rs.weight)];
      } else if (rs.type === 'address-split') {
        return [rs.address, getSplitPercent(rs.weight)];
      } else if (rs.type === 'drip-list-split') {
        return [rs.listId, getSplitPercent(rs.weight)];
      } else {
        return undefined;
      }
    }),
  );

  if (projectToAdd) {
    items[projectToAdd.source.url] = projectItem(projectToAdd);
  }

  let listValid = false;
  $: nameValid = listName.length > 0;

  // TODO: Auto-refresh UI when splits change
  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const nftDriverTxFactory = await getNFTDriverTxFactory();
          const dripListService = await DripListService.new();
          const callerClient = await getCallerClient();

          const { receivers, projectsSplitMetadata } =
            await dripListService.getProjectsSplitMetadataAndReceivers({
              percentages,
              items,
            });

          const setSplitsTx = await nftDriverTxFactory.setSplits(dripListId, receivers);

          const metadataManager = new NftDriverMetadataManager();

          const currentMetadata = await metadataManager.fetchAccountMetadata(dripListId);
          assert(currentMetadata);

          const newMetadata: z.infer<typeof nftDriverAccountMetadataSchema> = {
            ...currentMetadata.data,
            name: listName,
            projects: projectsSplitMetadata,
          };

          const hash = await metadataManager.pinAccountMetadata(newMetadata);

          const metadataTx = await nftDriverTxFactory.emitAccountMetadata(
            dripListId,
            [
              {
                key: MetadataManagerBase.USER_METADATA_KEY,
                value: hash,
              },
            ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value)),
          );

          return { callerClient, setSplitsTx, metadataTx };
        },

        transactions: ({ callerClient, setSplitsTx, metadataTx }) => ({
          transaction: () => callerClient.callBatched([setSplitsTx, metadataTx]),
        }),
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
  <FormField title="Drip List Name*">
    <TextInput bind:value={listName} />
  </FormField>
  <FormField title="Recipients*">
    <ListEditor bind:items bind:percentages bind:valid={listValid} />
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide}>Cancel</Button>
    <Button on:click={submit} disabled={!listValid || !nameValid} icon={Wallet} variant="primary"
      >Confirm changes in wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import type { ComponentProps } from 'svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import VisibilityIcon from './components/VisibilityIcon.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import createRpgfCustomDatasetFlow from '$lib/flows/create-rpgf-custom-dataset/create-rpgf-custom-dataset-flow';
  import Trash from '$lib/components/icons/Trash.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteCustomDataset } from '$lib/utils/rpgf/rpgf';
  import { invalidate } from '$app/navigation';
  import Sharrow from '$lib/components/icons/Sharrow.svelte';
  import editRpgfCustomDatasetFlow from '$lib/flows/edit-rpgf-custom-dataset/edit-rpgf-custom-dataset-flow';
  import uploadRpgfCustomDatasetCsvFlow from '$lib/flows/upload-rpgf-custom-dataset-csv/upload-rpgf-custom-dataset-csv-flow';

  let { data } = $props();

  interface CustomDatasetTableRow {
    name: string;
    visibilityIcon: ComponentProps<typeof VisibilityIcon>;
    rowCount: string;
    editButton: ComponentProps<typeof Button>;
    uploadButton: ComponentProps<typeof Button>;
    deleteButton: ComponentProps<typeof Button>;
  }

  let customDatasetTableData: CustomDatasetTableRow[] = $derived(
    data.customDatasets.map((cds) => ({
      name: cds.name,
      visibilityIcon: {
        visible: cds.isPublic,
      },
      rowCount: cds.rowCount.toString(),
      editButton: {
        variant: 'ghost',
        circular: true,
        icon: Pen,
        ariaLabel: 'Edit dataset',
        // If round is published, mandate at least one category
        onclick: () =>
          modal.show(Stepper, undefined, editRpgfCustomDatasetFlow(cds, data.customDatasets)),
      },
      uploadButton: {
        variant: 'ghost',
        circular: true,
        icon: Sharrow,
        ariaLabel: 'Upload dataset CSV',
        // If round is published, mandate at least one category
        onclick: () => modal.show(Stepper, undefined, uploadRpgfCustomDatasetCsvFlow(cds)),
      },
      deleteButton: {
        variant: 'ghost',
        circular: true,
        icon: Trash,
        ariaLabel: 'Delete dataset',
        // If round is published, mandate at least one category
        onclick: () => {
          doWithConfirmationModal(
            'Are you sure you want to delete this custom dataset? This action cannot be undone.',
            () =>
              doWithErrorModal(async () => {
                await deleteCustomDataset(undefined, data.round.id, cds.id);
                await invalidate('rpgf:round:applications:custom-datasets');
              }),
          );
        },
      },
    })),
  );

  const customDatasetTableColumns: ColumnDef<CustomDatasetTableRow>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (v) => v,
      enableSorting: false,
    },
    {
      header: 'Row count',
      accessorKey: 'rowCount',
      cell: (v) => v,
      enableSorting: false,
    },
    {
      header: 'Visibility',
      accessorKey: 'visibilityIcon',
      cell: () => VisibilityIcon,
      enableSorting: false,
    },
    {
      accessorKey: 'uploadButton',
      cell: () => Button,
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: 'editButton',
      cell: () => Button,
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: 'deleteButton',
      cell: () => Button,
      enableSorting: false,
      size: 40,
    },
  ];
</script>

<RpgfSettingsForm>
  <FormField
    title="Custom Datasets"
    descriptionMd="Upload a dataset that is displayed on the application view, useful for giving badgeholders additional context. Datasets set to visible are immediately shown on application views and included with CSV exports. [Learn more](https://docs.drips.network/rpgf/advanced/custom-datasets)"
    type="div"
  >
    <PaddedHorizontalScroll>
      {#if customDatasetTableData.length === 0}
        <p class="typo-text" style:margin="1rem 0">No custom datasets created yet.</p>
      {:else}
        <div class="table-wrapper">
          <Table
            options={{
              data: customDatasetTableData,
              columns: customDatasetTableColumns,
              getCoreRowModel: getCoreRowModel(),
            }}
          />
        </div>
      {/if}
    </PaddedHorizontalScroll>

    <Button
      icon={Plus}
      onclick={() =>
        modal.show(
          Stepper,
          undefined,
          createRpgfCustomDatasetFlow(data.round.id, data.customDatasets),
        )}>Add custom dataset</Button
    >
  </FormField>
</RpgfSettingsForm>

<style>
  .table-wrapper {
    margin-bottom: 1.5rem;
  }
</style>

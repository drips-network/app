<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import Table from '$lib/components/table/table.svelte';
  import createRpgfCategoryFlow from '$lib/flows/create-rpgf-category/create-rpgf-category-flow.js';
  import modal from '$lib/stores/modal/index.js';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import type { ComponentProps } from 'svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import createRpgfApplicationFormFlow from '$lib/flows/create-rpgf-application-form/create-rpgf-application-form-flow';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteApplicationCategory, deleteApplicationForm } from '$lib/utils/rpgf/rpgf';
  import { invalidate } from '$app/navigation';

  export let data;

  interface CategoryTableRow {
    name: string;
    formName: string;
    deleteButton: ComponentProps<Button>;
  }

  let categoriesTableData: CategoryTableRow[];
  $: categoriesTableData = data.applicationCategories.map((cat) => ({
    name: cat.name,
    formName: cat.applicationForm.name,
    deleteButton: {
      variant: 'ghost',
      circular: true,
      icon: Trash,
      ariaLabel: 'Delete category',
      // If round is published, mandate at least one category
      disabled: data.round.published && data.applicationCategories.length <= 1,
      onClick: () => {
        doWithConfirmationModal(
          'Are you sure you want to delete this category? This action cannot be undone.',
          () =>
            doWithErrorModal(async () => {
              await deleteApplicationCategory(undefined, data.round.id, cat.id);
              await invalidate('rpgf:round:applications:categories-and-forms');
            }),
        );
      },
    },
  }));

  const categoryTableColumns: ColumnDef<CategoryTableRow>[] = [
    {
      header: 'Category Name',
      accessorKey: 'name',
      cell: (v) => v,
      enableSorting: false,
    },
    {
      header: 'Application Form',
      accessorKey: 'formName',
      cell: (v) => v,
      enableSorting: false,
    },
    {
      accessorKey: 'deleteButton',
      cell: () => Button,
      enableSorting: false,
      size: 40,
    },
  ];

  interface FormTableRow {
    name: string;
    deleteButton: ComponentProps<Button>;
    editButton: ComponentProps<Button>;
  }

  let formsTableData: FormTableRow[];
  $: formsTableData = data.applicationForms.map((form) => ({
    name: form.name,
    deleteButton: {
      variant: 'ghost',
      circular: true,
      icon: Trash,
      ariaLabel: 'Delete form',
      // disabled if assigned to a category
      disabled: data.applicationCategories.some((cat) => cat.applicationForm.id === form.id),
      onClick: () => {
        doWithConfirmationModal(
          'Are you sure you want to delete this form? This action cannot be undone.',
          () =>
            doWithErrorModal(async () => {
              await deleteApplicationForm(undefined, data.round.id, form.id);
              await invalidate('rpgf:round:applications:categories-and-forms');
            }),
        );
      },
    },
    editButton: {
      variant: 'ghost',
      circular: true,
      icon: Pen,
      ariaLabel: 'Edit form',
      href: `/app/rpgf/rounds/${data.round.id}/settings/application/forms/${form.id}`,
    },
  }));

  const formTableColumns: ColumnDef<FormTableRow>[] = [
    {
      header: 'Form Name',
      accessorKey: 'name',
      cell: (v) => v,
      enableSorting: false,
    },
    {
      accessorKey: 'editButton',
      cell: () => Button,
      enableSorting: false,
      size: 24,
    },
    {
      enableSorting: false,
      accessorKey: 'deleteButton',
      cell: () => Button,
      size: 40,
    },
  ];
</script>

<RpgfSettingsForm round={data.round}>
  <FormField
    title="Categories"
    description="When creating a new application, applicants first select one of these categories. Each category can have a unique application form assigned to it. If you only create a single category, all applications will use that one."
    type="div"
  >
    <PaddedHorizontalScroll>
      {#if categoriesTableData.length === 0}
        <p class="typo-text" style:margin="1rem 0">No categories created yet.</p>
      {:else}
        <div class="table-wrapper">
          <Table
            options={{
              data: categoriesTableData,
              columns: categoryTableColumns,
              getCoreRowModel: getCoreRowModel(),
            }}
          />
        </div>
      {/if}
    </PaddedHorizontalScroll>

    <Button
      icon={Plus}
      on:click={() =>
        modal.show(
          Stepper,
          undefined,
          createRpgfCategoryFlow(data.round.id, data.applicationCategories, data.applicationForms),
        )}>Add category</Button
    >
  </FormField>

  <FormField
    title="Forms"
    description="Manage application forms that can be assigned to categories."
    type="div"
  >
    <PaddedHorizontalScroll>
      {#if formsTableData.length === 0}
        <p class="typo-text" style:margin="1rem 0">No forms created yet.</p>
      {:else}
        <div class="table-wrapper">
          <Table
            options={{
              data: formsTableData,
              columns: formTableColumns,
              getCoreRowModel: getCoreRowModel(),
            }}
          />
        </div>
      {/if}
    </PaddedHorizontalScroll>

    <Button
      icon={Plus}
      on:click={() => modal.show(Stepper, undefined, createRpgfApplicationFormFlow(data.round.id))}
      >Create new form</Button
    >
  </FormField>
</RpgfSettingsForm>

<style>
  .table-wrapper {
    margin-bottom: 1.5rem;
  }
</style>

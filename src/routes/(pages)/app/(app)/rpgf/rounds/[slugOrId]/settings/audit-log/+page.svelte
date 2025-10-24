<script lang="ts">
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { AuditLogAction, AuditLogActor } from '$lib/utils/rpgf/types/auditLog';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import modal from '$lib/stores/modal';
  import LogDetailModal from './components/log-detail-modal.svelte';
  import LogActorCell from './components/log-actor-cell.svelte';

  export let data;

  const FRIENDLY_NAME_MAP: Record<AuditLogAction, string> = {
    round_created: 'Round created',
    round_settings_changed: 'Round settings changed',
    round_voters_changed: 'Round voters changed',
    round_admins_changed: 'Round admins changed',
    round_published: 'Round published',
    round_deleted: 'Round deleted',
    application_submitted: 'Application submitted',
    application_updated: 'Application updated',
    application_reviewed: 'Applications reviewed',
    ballot_submitted: 'Ballot submitted',
    ballot_updated: 'Ballot updated',
    results_calculated: 'Results calculated',
    results_published: 'Results published',
    linked_drip_lists_edited: 'Linked drip lists edited',
    application_category_created: 'Application category created',
    application_category_updated: 'Application category updated',
    application_category_deleted: 'Application category deleted',
    application_form_created: 'Application form created',
    application_form_updated: 'Application form updated',
    application_form_deleted: 'Application form deleted',
    kyc_request_created: 'KYC created',
    kyc_request_linked_to_application: 'KYC linked to application',
    kyc_request_updated: 'KYC status updated',
    custom_dataset_created: 'Custom dataset created',
    custom_dataset_updated: 'Custom dataset updated',
    custom_dataset_deleted: 'Custom dataset deleted',
    custom_dataset_uploaded: 'Custom dataset uploaded',
  } as const;

  interface LogTableRow {
    actor: { actor: AuditLogActor };
    action: string;
    createdAt: string;
  }

  const logTableColumns: ColumnDef<LogTableRow>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: (v) => v,
      size: 1,
      enableSorting: false,
    },
    {
      accessorKey: 'actor',
      header: 'User',
      cell: () => LogActorCell,
      size: 1,
      enableSorting: false,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: (v) => v,
      size: 1,
      enableSorting: false,
    },
  ];

  $: logTableData = data.auditLog.map((entry) => ({
    actor: { actor: entry.actor },
    action: FRIENDLY_NAME_MAP[entry.action],
    createdAt: formatDate(entry.createdAt),
  }));

  function handleRowClick(e: CustomEvent<RowClickEventPayload>) {
    modal.show(LogDetailModal, undefined, {
      log: data.auditLog[e.detail.rowIndex],
    });
  }
</script>

<RpgfSettingsForm>
  <PaddedHorizontalScroll>
    <Table
      isRowClickable
      options={{
        data: logTableData,
        columns: logTableColumns,
        getCoreRowModel: getCoreRowModel(),
      }}
      on:rowClick={handleRowClick}
    />
  </PaddedHorizontalScroll>
</RpgfSettingsForm>

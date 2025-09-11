<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { AuditLogAction } from '$lib/utils/rpgf/types/auditLog';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import modal from '$lib/stores/modal';
  import LogDetailModal from './components/log-detail-modal.svelte';

  export let data;

  const FRIENDLY_NAME_MAP: Record<AuditLogAction, string> = {
    round_created: 'Round created',
    round_settings_changed: 'Round settings changed',
    round_voters_changed: 'Round voters changed',
    round_admins_changed: 'Round admins changed',
    round_published: 'Round published',
    round_deleted: 'Round deleted',
    application_submitted: 'Application submitted',
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
  } as const;

  interface LogTableRow {
    user: {
      address: string;
    };
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
      accessorKey: 'user',
      header: 'User',
      cell: () => IdentityBadge,
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
    user: { address: entry.userWalletAddress },
    action: FRIENDLY_NAME_MAP[entry.action],
    createdAt: formatDate(entry.createdAt),
  }));

  function handleRowClick(e: CustomEvent<RowClickEventPayload>) {
    modal.show(LogDetailModal, undefined, {
      log: data.auditLog[e.detail.rowIndex],
    });
  }
</script>

<RpgfSettingsForm round={data.round}>
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

<style>
</style>

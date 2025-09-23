<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import formatDate from '$lib/utils/format-date.js';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';

  export let data;

  interface HistoryEntryRow {
    timestamp: string;
    applicationBadge: ComponentProps<RpgfApplicationBadge>;
  }

  const historyTableColumns: ColumnDef<HistoryEntryRow>[] = [
    {
      accessorKey: 'applicationBadge',
      header: '',
      cell: () => RpgfApplicationBadge,
      size: 1,
      enableSorting: false,
    },
    {
      accessorKey: 'timestamp',
      header: '',
      cell: (v) => v,
      size: 1,
      enableSorting: false,
    },
  ];

  $: historyTableData = data.history.map((version) => ({
    timestamp: formatDate(version.createdAt),
    applicationBadge: {
      application: {
        id: data.application.id,
        projectName: version.projectName,
        dripsProjectDataSnapshot: version.dripsProjectDataSnapshot,
        allocation: null,
      },
      hideState: true,
      excludeFromViewTransition: true,
      size: 'small' as ComponentProps<RpgfApplicationBadge>['size'],
    },
  }));

  function handleRowClick(e: CustomEvent<RowClickEventPayload>) {
    const version = data.history[e.detail.rowIndex];

    goto(
      `/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}/history/${version.id}`,
    );
  }
</script>

<Button
  icon={ArrowLeft}
  href={`/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}`}
  >Back to application</Button
>

<PaddedHorizontalScroll>
  <Table
    options={{
      data: historyTableData,
      columns: historyTableColumns,
      getCoreRowModel: getCoreRowModel(),
    }}
    isRowClickable={true}
    on:rowClick={handleRowClick}
  />
</PaddedHorizontalScroll>

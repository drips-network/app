<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import formatDate from '$lib/utils/format-date.js';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';

  let { data } = $props();

  interface HistoryEntryRow {
    timestamp: string;
    applicationBadge: ComponentProps<typeof RpgfApplicationBadge>;
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

  let historyTableData = $derived(data.history.map((version) => ({
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
      size: 'small' as ComponentProps<typeof RpgfApplicationBadge>['size'],
    },
  })));

  function handleRowClick({ rowIndex }: RowClickEventPayload) {
    const version = data.history[rowIndex];

    goto(
      `/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}/history/${version.id}${$page.url.search}`,
    );
  }
</script>

<Button
  icon={ArrowLeft}
  href={`/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}${$page.url.search}`}
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
    onRowClick={handleRowClick}
  />
</PaddedHorizontalScroll>

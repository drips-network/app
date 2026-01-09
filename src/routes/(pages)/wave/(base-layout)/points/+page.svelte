<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Table from '$lib/components/table/table.svelte';
  import Source from '$lib/components/wave/points/source.svelte';
  import formatDate from '$lib/utils/format-date.js';
  import type { PointsLedgerEntryDto } from '$lib/utils/wave/types/points.js';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';

  let { data } = $props();
  let {
    pointsHistory: { data: pointsHistory },
  } = $derived(data);

  interface LedgerEntryTableRow {
    points: number;
    source: {
      source: PointsLedgerEntryDto['source'];
    };
    earnedAt: string;
    programAndWave: string;
  }

  let tableData = $derived(
    pointsHistory.map(
      (entry): LedgerEntryTableRow => ({
        points: entry.points,
        source: {
          source: entry.source,
        },
        earnedAt: formatDate(entry.createdAt),
        programAndWave: entry.waveProgram
          ? `${entry.waveProgram.name}${entry.wave ? ` - Wave ${entry.wave.waveNumber}` : ''}`
          : 'N/A',
      }),
    ),
  );

  const tableColumns: ColumnDef<LedgerEntryTableRow>[] = [
    {
      header: 'Points',
      accessorKey: 'points',
      enableSorting: false,
      cell: (c) => c,
      size: 1,
    },
    {
      header: 'Source',
      accessorKey: 'source',
      enableSorting: false,
      cell: () => Source,
    },
    {
      header: 'Program & Wave',
      accessorKey: 'programAndWave',
      enableSorting: false,
      cell: (c) => c,
    },
    {
      header: 'Earned at',
      accessorKey: 'earnedAt',
      enableSorting: false,
      cell: (c) => c,
    },
  ];

  let tableOptions = $derived({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });
</script>

<HeadMeta title="Points History | Wave" />

<Section
  header={{
    label: 'Points history',
    icon: Trophy,
    infoTooltip: 'Earn Points by completing issues within active Waves.',
  }}
  skeleton={{
    loaded: true,
    empty: pointsHistory.length === 0,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No Points yet',
    emptyStateText: 'Earn Points by completing issues within active Waves.',
  }}
>
  <PaddedHorizontalScroll>
    <Table options={tableOptions} />
  </PaddedHorizontalScroll>
</Section>

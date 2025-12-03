<script lang="ts">
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
    waveAndCycle: string;
  }

  let tableData = $derived(
    pointsHistory.map(
      (entry): LedgerEntryTableRow => ({
        points: entry.points,
        source: {
          source: entry.source,
        },
        earnedAt: formatDate(entry.createdAt),
        waveAndCycle: entry.wave
          ? `${entry.wave.name}${entry.waveCycle ? ` - Cycle ${entry.waveCycle.cycleNumber}` : ''}`
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
      header: 'Wave & Cycle',
      accessorKey: 'waveAndCycle',
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

<Section
  header={{
    label: 'Points history',
    icon: Trophy,
    infoTooltip:
      "Earn points by completing tasks within Wave Cycles. At the end of each Cycle, you'll receive a percentage of the Wave's total reward pool based on the points you earned.",
  }}
  skeleton={{
    loaded: true,
    empty: pointsHistory.length === 0,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No points history yet',
    emptyStateText: 'Earn points by completing tasks and participating in the community.',
  }}
>
  <PaddedHorizontalScroll>
    <Table options={tableOptions} />
  </PaddedHorizontalScroll>
</Section>

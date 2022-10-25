<script lang="ts">
  import TokenStreamIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import streams from '$lib/stores/streams/streams.store';
  import IdentityBadgeCell from '$lib/components/table/cells/identity-badge.cell.svelte';
  import balancesStore from '$lib/stores/balances/balances.store';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import balances from '$lib/stores/balances';

  interface OutgoingStreamTableRow {
    name: string;
    toAddress: string;
    amount: AmountCellData;
  }

  interface IncomingStreamTableRow {
    name: string;
    fromAddress: string;
    amount: AmountCellData;
  }

  let outgoingTableData: OutgoingStreamTableRow[] = [];
  let incomingTableData: IncomingStreamTableRow[] = [];

  function updateTable() {
    outgoingTableData = ($streams.ownStreams?.outgoing ?? []).map((stream) => ({
      name: stream.name ?? 'Unnamed stream',
      toAddress: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
      amount: {
        amount: {
          amount: balances.getEstimateByStreamId(stream.id)?.totalStreamed ?? 0n,
          tokenAddress: stream.dripsConfig.amountPerSecond.tokenAddress,
        },
        amountPerSecond: stream.dripsConfig.amountPerSecond,
      },
    }));

    incomingTableData = ($streams.ownStreams?.incoming ?? []).map((stream) => ({
      name: stream.name ?? 'Unnamed stream',
      fromAddress: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
      amount: {
        amountPerSecond: stream.dripsConfig.amountPerSecond,
        amount: {
          amount: balances.getEstimateByStreamId(stream.id)?.totalStreamed ?? 0n,
          tokenAddress: stream.dripsConfig.amountPerSecond.tokenAddress,
        },
      },
    }));
  }

  $: {
    $streams.ownStreams;
    $balancesStore;
    updateTable();
  }

  const outgoingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: 'toAddress',
      header: 'To',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
    },
    {
      accessorKey: 'amount',
      header: 'Amount streamed',
      cell: () => Amount,
      enableSorting: false,
    },
  ];

  const incomingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: 'fromAddress',
      header: 'From',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
    },
    {
      accessorKey: 'amount',
      header: 'Amount earned',
      cell: () => Amount,
      enableSorting: false,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let optionsOutgoing: TableOptions<any>;
  $: optionsOutgoing = {
    data: outgoingTableData,
    columns: outgoingTableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let optionsIncoming: TableOptions<any>;
  $: optionsIncoming = {
    data: incomingTableData,
    columns: incomingTableColumns,
    getCoreRowModel: getCoreRowModel(),
  };
</script>

<div class="section">
  <SectionHeader
    icon={TokenStreamIcon}
    label="Streams"
    actions={[
      {
        handler: () => undefined,
        icon: PlusIcon,
        label: 'Create stream',
      },
    ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateEmoji="🫙"
      emptyStateHeadline="No streams"
      emptyStateText="This is where incoming and outgoing streams for your account will appear."
      loaded={$streams.ownStreams !== undefined && Object.keys($balancesStore.accounts).length > 0}
      empty={$streams.ownStreams?.incoming.length === 0 &&
        $streams.ownStreams?.outgoing.length === 0}
    >
      {#if optionsOutgoing.data.length > 0}
        <div class="table-container">
          <h4 class="table-group-header">↑ Outgoing</h4>
          <Table options={optionsOutgoing} />
        </div>
      {/if}
      {#if optionsIncoming.data.length > 0}
        <div class="table-container">
          <h4 class="table-group-header">↓ Incoming</h4>
          <Table options={optionsIncoming} />
        </div>
      {/if}
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .content {
    margin: 0 -1rem 0 -1rem;
    overflow-y: scroll;
  }

  .table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .table-container:first-child:not(:last-child) {
    margin-bottom: 2rem;
  }

  .table-group-header {
    color: var(--color-foreground-level-6);
    margin-left: calc(0.75rem + 2px);
  }

  @media (max-width: 1024px) {
    .content {
      padding: 0 1rem 0 1rem;
    }

    .table-group-header {
      margin-left: none;
    }
  }
</style>

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
        amountPerSecond: stream.paused ? 0n : stream.dripsConfig.amountPerSecond.amount,
        tokenAddress: stream.dripsConfig.amountPerSecond.tokenAddress,
        amount:
          $balancesStore.accounts[stream.sender.userId]?.[
            stream.dripsConfig.amountPerSecond.tokenAddress
          ]?.streams[stream.id].totalStreamed.amount ?? BigInt(100),
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
    },
    {
      accessorKey: 'fromAddress',
      header: 'To',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
    },
    {
      accessorKey: 'amountPerSecond',
      header: 'Amount',
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
  {#if outgoingTableData.length > 0}
    <h4>Outgoing</h4>
    <div class="table-container">
      <Table options={optionsOutgoing} />
    </div>
  {/if}
  <!-- {#if optionsIncoming.data.length > 0}
    <h4>Incoming</h4>
    <div class="table-container">
        <Table options={optionsIncoming} />
    </div>
  {/if} -->
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .table-container {
    margin: 0 -1rem 0 -1rem;
    overflow-y: scroll;
  }

  @media (max-width: 1024px) {
    .table-container {
      padding: 0 1rem 0 1rem;
    }
  }
</style>

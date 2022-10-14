<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import TopUpIcon from 'radicle-design-system/icons/Topup.svelte';
  import CollectIcon from 'radicle-design-system/icons/ArrowUp.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import TokenCell from '$lib/components/table/cells/token.cell.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import balances from '$lib/stores/balances/balances.store';
  import Amount from '$lib/components/table/cells/amount.cell.svelte';
  import wallet from '$lib/stores/wallet';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import streams from '$lib/stores/streams';
  import { get } from 'svelte/store';

  interface TokenTableRow {
    token: string;
    earnings: {
      amount: bigint;
      amountPerSecond: bigint;
      tokenAddress: string;
      showSymbol: false;
    };
    streaming: {
      amount: bigint;
      amountPerSecond: bigint;
      tokenAddress: string;
      showSymbol: false;
    };
    netRate: {
      amountPerSecond: bigint;
      tokenAddress: string;
      showSymbol: false;
    };
  }

  let tableData: TokenTableRow[] = [];

  $: accountEstimate =
    $wallet.connected && $balances.accounts['875267609686611184008791658115888920329297355417'];

  function getIncomingTotalsForToken(address: string): {
    totalEarned: bigint;
    amountPerSecond: bigint;
  } {
    const streamsState = get(streams);
    const estimates = get(balances);

    if (!streamsState.ownStreams) return { totalEarned: 0n, amountPerSecond: 0n };

    const incomingStreamsForToken = streamsState.ownStreams.incoming.filter(
      (stream) => stream.dripsConfig.amountPerSecond.tokenAddress === address,
    );

    return incomingStreamsForToken.reduce<{ totalEarned: bigint; amountPerSecond: bigint }>(
      (acc, stream) => {
        const estimate = estimates.accounts[stream.sender.userId]?.[address]?.streams[stream.id];

        if (!estimate) throw new Error(`Unknown estimate for stream ${stream.id}`);

        return {
          totalEarned: acc.totalEarned + estimate.totalStreamed.amount,
          amountPerSecond: acc.amountPerSecond + estimate.amountPerSecond.amount,
        };
      },
      { totalEarned: 0n, amountPerSecond: 0n },
    );
  }

  function updateTable() {
    if (!$balances || !accountEstimate) {
      tableData = [];
      return;
    }

    tableData = Object.entries(accountEstimate).map(([tokenAddress, estimate]) => {
      const incomingTotals = getIncomingTotalsForToken(tokenAddress);

      return {
        token: tokenAddress,
        earnings: {
          amount: incomingTotals.totalEarned,
          tokenAddress: tokenAddress,
          showSymbol: false,
          amountPerSecond: incomingTotals.amountPerSecond,
        },
        streaming: {
          ...estimate.totals.remainingBalance,
          amountPerSecond: -estimate.totals.amountPerSecond.amount,
          showSymbol: false,
        },
        netRate: {
          amountPerSecond: incomingTotals.amountPerSecond - estimate.totals.amountPerSecond.amount,
          tokenAddress: tokenAddress,
          showSymbol: false,
        },
      };
    });
  }

  $: {
    $balances;
    updateTable();
  }

  const tableColumns: ColumnDef<TokenTableRow>[] = [
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
    },
    {
      accessorKey: 'earnings',
      header: 'Earnings',
      cell: () => Amount,
      enableSorting: false,
    },
    {
      accessorKey: 'streaming',
      header: 'Streaming',
      cell: () => Amount,
      enableSorting: false,
    },
    {
      accessorKey: 'netRate',
      header: 'Net rate',
      cell: () => Amount,
      enableSorting: false,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: TableOptions<any>;
  $: options = {
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };
</script>

<div class="section">
  <SectionHeader
    icon={TokensIcon}
    label="Balances"
    actions={[
      {
        handler: () => undefined,
        icon: TopUpIcon,
        label: 'Top up',
      },
      {
        handler: () => undefined,
        icon: CollectIcon,
        label: 'Collect',
      },
    ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateHeadline="No tokens"
      emptyStateEmoji="🫗"
      emptyStateText="This is where any tokens balances you stream or earned show up."
      loaded={Boolean(accountEstimate)}
      empty={tableData.length === 0}
    >
      <Table {options} />
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

  @media (max-width: 1024px) {
    .content {
      padding: 0 1rem 0 1rem;
    }
  }
</style>

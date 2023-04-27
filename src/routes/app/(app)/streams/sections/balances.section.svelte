<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import balances from '$lib/stores/balances/balances.store';
  import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import modal from '$lib/stores/modal';
  import assert from '$lib/utils/assert';
  import { goto } from '$app/navigation';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import unreachable from '$lib/utils/unreachable';
  import { AddressDriverClient } from 'radicle-drips';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import getTopUpFlowSteps from '$lib/flows/top-up-flow/top-up-flow-steps';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import tokens from '$lib/stores/tokens';
  import accountFetchStatussesStore from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';

  interface TokenTableRow {
    token: TokenCellData;
    earnings: AmountCellData;
    streaming: AmountCellData;
    netRate: AmountCellData;
  }

  export let userId: string | undefined;
  export let disableActions = true;

  $: accountEstimate = userId ? $balances.accounts[userId] : undefined;

  let tableData: TokenTableRow[] = [];

  function updateTable() {
    if (!$balances || !accountEstimate || !userId) {
      tableData = [];
      return;
    }

    // TODO: Only consider relevant tokens here.
    const tokensToShow = $tokens?.map((t) => t.info.address) ?? [];

    tableData = mapFilterUndefined(tokensToShow, (tokenAddress) => {
      assert(userId);

      const outgoingEstimate = accountEstimate?.tokens[tokenAddress.toLowerCase()];
      const incomingEstimate = balances.getIncomingBalanceForUser(tokenAddress, userId);

      if (!incomingEstimate) return undefined;
      if (!outgoingEstimate?.total.totals.remainingBalance && !incomingEstimate.totalEarned) {
        return undefined;
      }

      return {
        token: {
          address: tokenAddress,
        },
        earnings: {
          amount: {
            amount: incomingEstimate.totalEarned,
            tokenAddress,
          },
          amountPerSecond: {
            amount: incomingEstimate.amountPerSecond,
            tokenAddress,
          },
          showSymbol: false,
        },
        streaming: {
          amount: {
            tokenAddress,
            amount: outgoingEstimate?.total.totals.remainingBalance ?? 0n,
          },
          amountPerSecond: {
            tokenAddress,
            amount: -(outgoingEstimate?.total.totals.totalAmountPerSecond ?? 0n),
          },
          showSymbol: false,
        },
        netRate: {
          amountPerSecond: {
            amount:
              incomingEstimate.amountPerSecond -
              (outgoingEstimate?.total.totals.totalAmountPerSecond ?? 0n),
            tokenAddress,
          },
          showSymbol: false,
        },
      };
    });
  }

  $: {
    $balances;
    if (userId) updateTable();
  }

  function buildTableColumns(isClickable = false): ColumnDef<TokenTableRow>[] {
    return [
      {
        accessorKey: 'token',
        header: 'Token',
        cell: () => TokenCell,
        enableSorting: false,
        size: (100 / 24) * 8,
      },
      {
        accessorKey: 'earnings',
        header: 'Incoming',
        cell: () => Amount,
        enableSorting: false,
        size: (100 / 24) * 5,
        meta: {
          tooltipMessage:
            "Your incoming balance is a real-time estimate of what you've earned up until this moment, minus any prior withdrawals.",
        },
      },
      {
        accessorKey: 'streaming',
        header: 'Outgoing',
        cell: () => Amount,
        enableSorting: false,
        size: (100 / 24) * 5,
        meta: {
          tooltipMessage:
            'Your outgoing balance is the remaining balance you can stream to others for this token.',
        },
      },
      {
        accessorKey: 'netRate',
        header: 'Net rate',
        cell: () => Amount,
        enableSorting: false,
        size: (100 / 24) * 2,
      },
      {
        accessorKey: 'chevron',
        header: '',
        cell: isClickable ? () => ChevronRightCell : undefined,
        enableSorting: false,
        size: (100 / 24) * 2,
      },
    ];
  }
  $: isMyBalances = userId === $wallet.dripsUserId;
  $: tableColumns = buildTableColumns(isMyBalances);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: TableOptions<any>;
  $: options = {
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  $: fetchStatus = userId ? $accountFetchStatussesStore[userId] : undefined;

  // As soon as the given account has been fetched at least once, display content.
  let loaded = false;
  $: if (userId && fetchStatus && ['error', 'fetched'].includes(fetchStatus.all)) {
    loaded = true;
  }

  $: error = Boolean(userId && fetchStatus?.all === 'error');

  function onRowClick(event: CustomEvent<RowClickEventPayload>) {
    // go to token page by address
    const tokenAddress = tableData[event.detail.rowIndex].token.address;
    assert(userId);
    const address = AddressDriverClient.getUserAddress(userId);
    goto(`/app/${address ?? unreachable()}/tokens/${tokenAddress}`);
  }
</script>

<div class="section">
  <SectionHeader
    icon={TokensIcon}
    label="Balances"
    actionsDisabled={!accountEstimate}
    actions={disableActions
      ? []
      : [
          {
            handler: () => modal.show(Stepper, undefined, getTopUpFlowSteps()),
            icon: Plus,
            label: 'Add funds',
          },
        ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateHeadline="No tokens"
      emptyStateEmoji="🫗"
      emptyStateText="This is where any tokens balances you stream or earned show up."
      {loaded}
      {error}
      empty={tableData.length === 0}
    >
      <Table {options} isRowClickable={isMyBalances} on:rowClick={onRowClick} />
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

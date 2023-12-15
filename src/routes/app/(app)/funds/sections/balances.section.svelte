<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Coin.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import balances from '$lib/stores/balances/balances.store';
  import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
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
  import Section from '$lib/components/section/section.svelte';

  interface TokenTableRow {
    token: TokenCellData;
    earnings: AmountCellData;
    streaming: AmountCellData;
    netRate: AmountCellData;
  }

  export let accountId: string | undefined;
  export let disableActions = true;

  export let collapsed = false;
  export let collapsable = false;

  $: accountEstimate = accountId ? $balances.accounts[accountId] : undefined;

  let tableData: TokenTableRow[] = [];

  function updateTable() {
    if (!$balances || !accountEstimate || !accountId) {
      tableData = [];
      return;
    }

    // TODO: Only consider relevant tokens here.
    const tokensToShow = $tokens?.map((t) => t.info.address) ?? [];

    tableData = mapFilterUndefined(tokensToShow, (tokenAddress) => {
      assert(accountId);

      const outgoingEstimate = accountEstimate?.tokens[tokenAddress.toLowerCase()];
      const incomingEstimate = balances.getIncomingBalanceForUser(tokenAddress, accountId);

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
    if (accountId) updateTable();
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
            'Your incoming balance is a real-time estimate of what youʼve earned up until this moment, minus any prior withdrawals.',
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
  $: isSelf = accountId === $wallet.dripsAccountId;
  $: tableColumns = buildTableColumns(isSelf);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: TableOptions<any>;
  $: options = {
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  $: fetchStatus = accountId ? $accountFetchStatussesStore[accountId] : undefined;

  // As soon as the given account has been fetched at least once, display content.
  let loaded = false;
  $: if (accountId && fetchStatus && ['error', 'fetched'].includes(fetchStatus.all)) {
    loaded = true;
  }

  $: error = Boolean(accountId && fetchStatus?.all === 'error');

  function onRowClick(event: CustomEvent<RowClickEventPayload>) {
    // go to token page by address
    const tokenAddress = tableData[event.detail.rowIndex].token.address;
    assert(accountId);
    const address = AddressDriverClient.getUserAddress(accountId);
    goto(`/app/${address ?? unreachable()}/tokens/${tokenAddress}`);
  }
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    label: 'Balances',
    icon: TokensIcon,
    actionsDisabled: !accountEstimate,
    actions: disableActions
      ? []
      : [
          {
            handler: () => modal.show(Stepper, undefined, getTopUpFlowSteps()),
            icon: Plus,
            label: 'Add funds',
            variant: 'primary',
          },
        ],
  }}
  skeleton={{
    emptyStateHeadline: 'No tokens',
    emptyStateEmoji: '🫗',
    emptyStateText: isSelf
      ? 'Top up any ERC-20 token to stream it to your Drip List or any Ethereum address.'
      : 'This user hasnʼt yet topped-up or received any funds.',
    loaded,
    error,
    empty: tableData.length === 0,
  }}
>
  <Table {options} isRowClickable={isSelf} on:rowClick={onRowClick} />
</Section>

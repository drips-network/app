<script lang="ts">
  import TokensIcon from '$lib/components/icons/Coin.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
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
  import Plus from '$lib/components/icons/Plus.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import tokens from '$lib/stores/tokens';
  import Section from '$lib/components/section/section.svelte';
  import type { ComponentProps } from 'svelte';
  import Token from '$lib/components/token/token.svelte';

  interface TokenTableRow {
    token: ComponentProps<Token>;
    earnings: AmountCellData;
    streaming: AmountCellData;
    netRate: AmountCellData;
  }

  export let accountId: string | undefined;
  export let disableActions = true;

  export let collapsed = false;
  export let collapsable = false;

  let tableData: TokenTableRow[] = [];

  function updateTable() {
    if (!accountId) {
      tableData = [];
      return;
    }

    // TODO: Only consider relevant tokens here.
    const tokensToShow = $tokens?.map((t) => t.info.address) ?? [];

    tableData = mapFilterUndefined(tokensToShow, (tokenAddress) => {
      assert(accountId);

      return {
        token: {
          address: tokenAddress,
        },
        earnings: {
          amount: {
            amount: 0n,
            tokenAddress,
          },
          amountPerSecond: {
            amount: 0n,
            tokenAddress,
          },
          showSymbol: false,
        },
        streaming: {
          amount: {
            tokenAddress,
            amount: 0n,
          },
          amountPerSecond: {
            tokenAddress,
            amount: -(0n),
          },
          showSymbol: false,
        },
        netRate: {
          amountPerSecond: {
            amount: 0n,
            tokenAddress,
          },
          showSymbol: false,
        },
      };
    });
  }

  $: {
    if (accountId) updateTable();
  }

  function buildTableColumns(isClickable = false): ColumnDef<TokenTableRow>[] {
    return [
      {
        accessorKey: 'token',
        header: 'Token',
        cell: () => Token,
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
          tooltipMessage: 'Funds sent from others since your last withdrawal.',
        },
      },
      {
        accessorKey: 'streaming',
        header: 'Outgoing',
        cell: () => Amount,
        enableSorting: false,
        size: (100 / 24) * 5,
        meta: {
          tooltipMessage: 'Your token balances for streaming to others.',
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
    actions: disableActions
      ? []
      : [
          {
            handler: () => modal.show(Stepper, undefined, getTopUpFlowSteps()),
            icon: Plus,
            label: 'Add funds',
          },
        ],
  }}
  skeleton={{
    emptyStateHeadline: 'No tokens',
    emptyStateEmoji: '🫗',
    emptyStateText: isSelf
      ? 'Top up any ERC-20 token to stream it to your Drip List or any Ethereum address.'
      : 'This user hasnʼt yet topped-up or received any funds.',
    loaded: true,
    empty: tableData.length === 0,
  }}
>
  <Table {options} isRowClickable={isSelf} on:rowClick={onRowClick} />
</Section>

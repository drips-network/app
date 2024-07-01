<script lang="ts" context="module">
  import { CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT } from '$lib/utils/current-amounts';
  import { gql } from 'graphql-request';

  export const USER_BALANCES_FRAGMENT = gql`
    ${CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT}
    fragment UserBalances on UserBalances {
      tokenAddress
      incoming {
        ...CurrentAmountsUserBalanceTimelineItem
      }
      outgoing {
        ...CurrentAmountsUserBalanceTimelineItem
      }
    }
  `;
</script>

<script lang="ts">
  import TokensIcon from '$lib/components/icons/Coin.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import assert from '$lib/utils/assert';
  import { goto } from '$app/navigation';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import unreachable from '$lib/utils/unreachable';
  import { AddressDriverClient } from 'radicle-drips';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Section from '$lib/components/section/section.svelte';
  import type { ComponentProps } from 'svelte';
  import Token from '$lib/components/token/token.svelte';
  import RealtimeAmount from '$lib/components/amount/realtime-amount.svelte';
  import type { UserBalancesFragment } from './__generated__/gql.generated';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import getTopUpFlowSteps from '$lib/flows/top-up-flow/top-up-flow-steps';
  import modal from '$lib/stores/modal';
  import Plus from '$lib/components/icons/Plus.svelte';

  interface TokenTableRow {
    token: ComponentProps<Token>;
    earnings: ComponentProps<RealtimeAmount>;
    streaming: ComponentProps<RealtimeAmount>;
  }

  export let userBalances: UserBalancesFragment[];

  export let accountId: string | undefined;
  export let disableActions = true;

  export let collapsed = false;
  export let collapsable = false;

  let tableData: TokenTableRow[] = [];
  $: tableData = userBalances.map((balance) => ({
    token: {
      address: balance.tokenAddress,
    },
    earnings: {
      tokenAddress: balance.tokenAddress,
      timeline: balance.incoming,
    },
    streaming: {
      tokenAddress: balance.tokenAddress,
      timeline: balance.outgoing,
    },
  }));

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
        cell: () => RealtimeAmount,
        enableSorting: false,
        size: (100 / 24) * 5,
        meta: {
          tooltipMessage: 'Funds sent from others since your last withdrawal.',
        },
      },
      {
        accessorKey: 'streaming',
        header: 'Outgoing',
        cell: () => RealtimeAmount,
        enableSorting: false,
        size: (100 / 24) * 5,
        meta: {
          tooltipMessage: 'Your token balances for streaming to others.',
        },
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
    actions:
      disableActions || !isSelf
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

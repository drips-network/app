<script lang="ts">
  import Table from '$lib/components/table/table.svelte';
  import tokens from '$lib/stores/tokens/tokens.store';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import Button from '$lib/components/button/button.svelte';
  import PlusIcon from '$lib/components/icons/Plus.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import {
    type ActionsCellProps,
    default as ActionsCell,
  } from '$lib/components/table/cells/actions.cell.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import ConfirmDeletion from './components/confirm-deletion.svelte';
  import {
    type AddressCellProps,
    default as AddressCell,
  } from '$lib/components/table/cells/address.cell.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Token from '$lib/components/token/token.svelte';
  import type { ComponentProps } from 'svelte';

  interface TokenTableRow {
    token: ComponentProps<Token>;
    address: AddressCellProps;
    symbol: string;
    decimals: number;
    actions: ActionsCellProps;
  }

  const tableColumns: ColumnDef<TokenTableRow>[] = [
    {
      accessorKey: 'token',
      header: 'Name',
      cell: () => Token,
      enableSorting: false,
      size: (100 / 24) * 7,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: () => AddressCell,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: (info) => info,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'decimals',
      header: 'decimals',
      cell: (info) => info,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'actions',
      cell: () => ActionsCell,
      size: (100 / 24) * 3,
    },
  ];

  let tokenTableData: TokenTableRow[];
  $: tokenTableData =
    $tokens
      ?.filter((t) => t.source === 'custom')
      .map((t) => ({
        token: {
          address: t.info.address,
        },
        address: {
          address: t.info.address,
        },
        symbol: t.info.symbol,
        decimals: t.info.decimals,
        actions: {
          actions: [
            {
              icon: Trash,
              handler: () =>
                modal.show(ConfirmDeletion, undefined, {
                  tokenAddress: t.info.address,
                  tokenName: t.info.name,
                }),
            },
          ],
        },
      })) ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: TableOptions<any>;
  $: options = {
    data: tokenTableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };
</script>

<HeadMeta title="Custom tokens" />

<div class="custom-tokens">
  <div class="hero">
    <div class="headline">
      <h1>Custom tokens</h1>
      <Button
        icon={PlusIcon}
        on:click={() => modal.show(Stepper, undefined, addCustomTokenFlowSteps())}
        >Add custom token</Button
      >
    </div>
    <p>
      Custom token information is stored locally in your browser, and unique to each network. Please
      ensure that any custom tokens you add are fully compliant with the ERC-20 token standard,
      otherwise deposits of these tokens <b class="typo-text-bold">may be unrecoverable.</b>
    </p>
  </div>
  <SectionSkeleton
    loaded
    empty={tokenTableData.length === 0}
    emptyStateEmoji="🫗"
    emptyStateText={'Add a new token by clicking "Add custom token" above'}
    emptyStateHeadline="No custom tokens"
  >
    <PaddedHorizontalScroll>
      <Table {options} />
    </PaddedHorizontalScroll>
  </SectionSkeleton>
</div>

<style>
  .custom-tokens {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero > .headline {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>

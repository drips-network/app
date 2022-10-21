<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    type ColumnDef,
    getCoreRowModel,
    type TableOptions,
    type OnChangeFn,
    type SortingState,
    getSortedRowModel,
  } from '@tanstack/svelte-table';
  import type { AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import AmountCell from '$lib/components/table/cells/amount.cell.svelte';
  import IdentityBadgeCell from '$lib/components/table/cells/identity-badge.cell.svelte';
  import Table from '$lib/components/table/table.svelte';

  interface IncomingStreamInfo {
    name: string;
    address: string;
    totalEarned: AmountCellData;
    amountPerSec: AmountCellData;
  }

  const defaultData: IncomingStreamInfo[] = [
    {
      name: 'Marketing Contributor',
      address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
      totalEarned: {
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        amount: BigInt('1000000000000000000'),
      },
      amountPerSec: {
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        amount: BigInt('1000000000000000'),
      },
    },
    {
      name: 'Windows support for Upstream',
      address: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
      totalEarned: {
        tokenAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        amount: BigInt('5000000000000000000'),
      },
      amountPerSec: {
        tokenAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        amount: BigInt('1000000000000000'),
      },
    },
    {
      name: 'RAD Contributor Vesting',
      address: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
      totalEarned: {
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        amount: BigInt('3000000000000000000'),
      },
      amountPerSec: {
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        amount: BigInt('1000000000000000'),
      },
    },
  ];

  const defaultColumns: ColumnDef<IncomingStreamInfo>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'address',
      cell: () => IdentityBadgeCell,
      header: 'From',
      enableSorting: false,
    },
    {
      accessorKey: 'totalEarned',
      cell: () => AmountCell,
      header: 'Total Earned',
      enableSorting: false,
    },
    {
      accessorKey: 'amountPerSec',
      cell: () => AmountCell,
      header: 'Amount per sec',
      enableSorting: false,
    },
  ];

  let sorting: SortingState = [
    {
      id: 'name',
      desc: false,
    },
  ];

  const setSorting: OnChangeFn<SortingState> = (updater) => {
    if (updater instanceof Function) {
      sorting = updater(sorting);
    } else {
      sorting = updater;
    }
    options.update((old) => ({
      ...old,
      state: {
        ...old.state,
        sorting,
      },
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = writable<TableOptions<any>>({
    data: defaultData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });
</script>

<Table options={$options} />

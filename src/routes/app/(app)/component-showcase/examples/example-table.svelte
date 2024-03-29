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
  import IdentityBadgeCell from '$lib/components/table/cells/user-badge.cell.svelte';
  import Table from '$lib/components/table/table.svelte';

  interface IncomingStreamInfo {
    name: string;
    from: {
      address: string;
      driver: 'address';
      accountId: string;
    };
    totalEarned: AmountCellData;
    amountPerSec: AmountCellData;
  }

  const defaultData: IncomingStreamInfo[] = [
    {
      name: 'Marketing Contributor',
      from: {
        address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
        accountId: '1234',
        driver: 'address',
      },
      totalEarned: {
        amount: {
          amount: BigInt('1000000000000000000'),
          tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
      },
      amountPerSec: {
        amount: {
          amount: BigInt('1000000000000000000'),
          tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
      },
    },
    {
      name: 'Windows support for Upstream',
      from: {
        address: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
        accountId: '1235',
        driver: 'address',
      },
      totalEarned: {
        amount: {
          amount: BigInt('5000000000000000000'),
          tokenAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        },
      },
      amountPerSec: {
        amount: {
          amount: BigInt('1000000000000000'),
          tokenAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        },
      },
    },
    {
      name: 'RAD Contributor Vesting',
      from: {
        address: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
        accountId: '1235',
        driver: 'address',
      },
      totalEarned: {
        amount: {
          amount: BigInt('3000000000000000000'),
          tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
      },
      amountPerSec: {
        amount: {
          amount: BigInt('1000000000000000'),
          tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
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
      accessorKey: 'from',
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

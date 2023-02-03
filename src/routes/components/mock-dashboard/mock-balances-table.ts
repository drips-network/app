import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
import Token, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';

const TOKEN_ADDRESS = '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3';

const balancesData: (millis: number) => TokenTableRow[] = (millis: number) => [
  {
    token: {
      address: TOKEN_ADDRESS,
      overrideToDisplay: {
        name: 'Radicle',
        logoURI: '/assets/rad-coin.webp',
        symbol: 'RAD',
      },
    },
    earnings: {
      amount: {
        amount: 1493289595996838272747n + (3858024691358025000n / 1000n) * BigInt(millis),
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 3858024691358025000n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
    },
    streaming: {
      amount: {
        amount: 10000000000000000000000n - (9958224691388025000n / 1000n) * BigInt(millis),
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: -9958224691388025000n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
    },
    netRate: {
      amountPerSecond: {
        amount: 3858024691358025000n - 9958224691388025000n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
      showSymbol: false,
    },
  },
  {
    token: {
      address: TOKEN_ADDRESS,
      overrideToDisplay: {
        name: 'USD Coin',
        logoURI: '/assets/usdc-coin.webp',
        symbol: 'USDC',
      },
    },
    earnings: {
      amount: {
        amount:
          49599488327719498585894000000n + (375739992881995883900000n / 1000n) * BigInt(millis),
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 375739992881995883900000n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'USDC',
        decimals: 16,
      },
    },
    streaming: {
      amount: {
        amount: 0n,
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 0n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'USDC',
        decimals: 16,
      },
    },
    netRate: {
      amountPerSecond: {
        amount: 375739992881995883900000n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'USDC',
        decimals: 16,
      },
      showSymbol: false,
    },
  },
];

interface TokenTableRow {
  token: TokenCellData;
  earnings: AmountCellData;
  streaming: AmountCellData;
  netRate: AmountCellData;
}

const balancesColumns: ColumnDef<TokenTableRow>[] = [
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
  },
  {
    accessorKey: 'streaming',
    header: 'Outgoing',
    cell: () => Amount,
    enableSorting: false,
    size: (100 / 24) * 5,
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
    cell: () => ChevronRightCell,
    enableSorting: false,
    size: (100 / 24) * 2,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const balancesOptions: (millis: number) => TableOptions<any> = (millis: number) => ({
  data: balancesData(millis),
  columns: balancesColumns,
  getCoreRowModel: getCoreRowModel(),
});

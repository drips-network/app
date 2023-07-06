import type { AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
import Amount from '$lib/components/table/cells/amount.cell.svelte';
import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
import IdentityBadge from '$lib/components/table/cells/user-badge.cell.svelte';
import type { TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
import Token from '$lib/components/table/cells/token.cell.svelte';
import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';

const TOKEN_ADDRESS = '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3';

const balancesData: (millis: number) => OutgoingStreamTableRow[] = (millis: number) => [
  {
    streamId: '',
    name: '👩‍💻 Development Contributor',
    to: {
      address: '0x60FC49f9639468e892359Ad8D2B95F31c6E85736',
      driver: 'address',
      accountId: '1234',
    },
    toAddress: '0x60FC49f9639468e892359Ad8D2B95F31c6E85736',
    amount: {
      amount: {
        amount: 1493289595996838272747n / 2n + (3858024691358025000n / 2n / 1000n) * BigInt(millis),
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 3858024691358025000n / 2n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
    },
    token: {
      address: TOKEN_ADDRESS,
      overrideToDisplay: {
        name: 'Radicle',
        logoURI: 'https://research.binance.com/static/images/projects/radicle/logo.png',
        symbol: 'RAD',
      },
      size: 'small',
    },
  },
  {
    streamId: '',
    name: '🪙 Token Vesting',
    to: {
      address: '0x8fAcf07E6101ed99986C2FA5d594354b776c7088',
      driver: 'address',
      accountId: '1234',
    },
    toAddress: '0x8fAcf07E6101ed99986C2FA5d594354b776c7088',
    amount: {
      amount: {
        amount: 1493289595996838272747n / 3n + (3858024691358025000n / 3n / 1000n) * BigInt(millis),
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 3858024691358025000n / 3n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
    },
    token: {
      address: TOKEN_ADDRESS,
      overrideToDisplay: {
        name: 'Radicle',
        logoURI: 'https://research.binance.com/static/images/projects/radicle/logo.png',
        symbol: 'RAD',
      },
      size: 'small',
    },
  },
  {
    streamId: '',
    name: '💸 Engineering Contributor',
    toAddress: '0x8fAcf07E6101ed99986C2FA5d594354b776c7088',
    to: {
      address: '0x8fAcf07E6101ed99986C2FA5d594354b776c7088',
      driver: 'address',
      accountId: '1234',
    },
    amount: {
      amount: {
        amount: 100n,
        tokenAddress: TOKEN_ADDRESS,
      },
      amountPerSecond: {
        amount: 100n,
        tokenAddress: TOKEN_ADDRESS,
      },
      overrideToDisplay: {
        symbol: 'RAD',
        decimals: 16,
      },
    },
    token: {
      address: TOKEN_ADDRESS,
      overrideToDisplay: {
        name: 'Radicle',
        logoURI: 'https://research.binance.com/static/images/projects/radicle/logo.png',
        symbol: 'RAD',
      },
      size: 'small',
    },
  },
];

interface OutgoingStreamTableRow {
  streamId: string;
  name: string;
  to: {
    driver: 'address';
    address: string;
    userId: string;
  };
  amount: AmountCellData;
  token: TokenCellData;
}

const streamsTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => info.getValue(),
    enableSorting: false,
    size: (100 / 24) * 8,
  },
  {
    accessorKey: 'to',
    header: 'To',
    cell: () => IdentityBadge,
    enableSorting: false,
    size: (100 / 24) * 5,
  },
  {
    accessorKey: 'amount',
    header: 'Total streamed',
    cell: () => Amount,
    enableSorting: false,
    size: (100 / 24) * 5,
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: () => Token,
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
export const streamsOptions: (millis: number) => TableOptions<any> = (millis: number) => ({
  data: balancesData(millis),
  columns: streamsTableColumns,
  getCoreRowModel: getCoreRowModel(),
});

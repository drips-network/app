<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const DRIP_LISTS_LISTINGS_ITEM_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    fragment DripListsListingsItem on DripList {
      ...DripListBadge
      description
      splits {
        ... on AddressReceiver {
          account {
            accountId
          }
        }
        ... on ProjectReceiver {
          account {
            accountId
          }
        }
        ... on DripListReceiver {
          account {
            accountId
          }
        }
      }
      support {
        ... on DripListSupport {
          account {
            accountId
          }
        }
        ... on ProjectSupport {
          account {
            accountId
          }
        }
        ... on OneTimeDonationSupport {
          account {
            accountId
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import Section from '$lib/components/section/section.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import DripListBadgeCell from '$lib/components/table/cells/drip-list-badge.cell.svelte';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { goto } from '$app/navigation';
  import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import type { DripListBadgeFragment } from '$lib/components/drip-list-badge/__generated__/gql.generated';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  export let data: PageData;

  interface TableRow {
    badge: DripListBadgeFragment;
    description: string;
    recipientsCount: number | string;
    supportersCount: number | string;
  }

  const tableData: TableRow[] = data.dripLists
    .map((dripList) => {
      return {
        badge: dripList,
        description: dripList.description ?? '',
        recipientsCount: dripList.splits.length.toString(),
        supportersCount:
          [
            ...new Set(
              mapFilterUndefined(
                dripList.support,
                (support) => 'account' in support && support.account?.accountId,
              ),
            ),
          ].length || '',
      } as TableRow;
    })
    .sort((a, b) => Number(b.recipientsCount) - Number(a.recipientsCount));

  const tableColumns: ColumnDef<TableRow>[] = [
    {
      accessorKey: 'badge',
      header: 'Name',
      cell: () => DripListBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 18,
    },
    // {
    //   accessorKey: 'description',
    //   header: 'Description',
    //   cell: (cell) => cell.getValue(),
    //   enableSorting: false,
    //   size: (100 / 24) * 8
    // },
    {
      accessorKey: 'recipientsCount',
      header: 'Drips to',
      cell: (info) => info.getValue(),
      enableSorting: false,
      size: (100 / 24) * 2,
    },
    {
      accessorKey: 'supportersCount',
      header: 'Supporters',
      cell: (info) => info.getValue(),
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

  function onRowClick(event: CustomEvent<RowClickEventPayload>) {
    const dripList = tableData[event.detail.rowIndex].badge;
    goto('/app/drip-lists/' + dripList.account.accountId);
  }
</script>

<article>
  <Section
    header={{
      icon: DripListIcon,
      label: 'All Drip Lists',
    }}
    skeleton={{
      horizontalScroll: true,
      loaded: true,
      empty: false,
      error: false,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'Nothing to see here',
      emptyStateText: "Couldn't fetch projects from the network",
    }}
  >
    <Table
      rowHeight={76}
      options={{
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
      }}
      isRowClickable={true}
      on:rowClick={onRowClick}
    />
  </Section>
</article>

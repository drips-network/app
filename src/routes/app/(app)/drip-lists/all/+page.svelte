<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const DRIP_LISTS_LISTINGS_ITEM_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    fragment DripListsListingsItem on DripList {
      ...DripListBadge
      splits {
        ... on AddressReceiver {
          account {
            address
          }
        }
        ... on ProjectReceiver {
          project {
            ...ProjectAvatar
          }
        }
        ... on DripListReceiver {
          dripList {
            ...DripListBadge
          }
        }
      }
      support {
        ... on DripListSupport {
          dripList {
            ...DripListBadge
          }
        }
        ... on ProjectSupport {
          project {
            ...ProjectAvatar
          }
        }
        ... on OneTimeDonationSupport {
          account {
            address
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
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import PileCell from '$lib/components/table/cells/pile-cell.svelte';
  import { addressIcon, dripListIcon, projectIcon } from '$lib/components/pile/pile-presets';
  import { PROJECT_AVATAR_FRAGMENT } from '$lib/components/project-avatar/project-avatar.svelte';
  import type { ComponentProps } from 'svelte';
  import type Pile from '$lib/components/pile/pile.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IdentityBadgeCell from '$lib/components/table/cells/identity-badge-cell.svelte';

  export let data: PageData;

  interface TableRow {
    badge: DripListBadgeFragment;
    owner: string;
    recipientsPile: ComponentProps<Pile>;
    supportersPile: ComponentProps<Pile>;
  }

  const tableData: TableRow[] = data.content.dripLists
    .map((dripList) => {
      return {
        badge: dripList,
        owner: dripList.owner.address,
        recipientsPile: {
          maxItems: 4,
          components: mapFilterUndefined(dripList.splits, (s) => {
            switch (s.__typename) {
              case 'DripListReceiver':
                return dripListIcon(s.dripList);
              case 'ProjectReceiver':
                return projectIcon(s.project);
              case 'AddressReceiver':
                return addressIcon(s.account.address);
            }
          }),
        },
        supportersPile: {
          maxItems: 4,
          components: mapFilterUndefined(dripList.support, (s) => {
            switch (s.__typename) {
              case 'DripListSupport':
                return dripListIcon(s.dripList);
              case 'ProjectSupport':
                return projectIcon(s.project);
              case 'OneTimeDonationSupport':
                return addressIcon(s.account.address);
            }
          }),
        },
      } as TableRow;
    })
    .sort(
      (a, b) =>
        (b.recipientsPile.components ?? []).length - (a.recipientsPile.components ?? []).length,
    );

  const tableColumns: ColumnDef<TableRow>[] = [
    {
      accessorKey: 'badge',
      header: 'Name',
      cell: () => DripListBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 10,
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 4,
    },
    {
      accessorKey: 'recipientsPile',
      header: 'Drips to',
      cell: () => PileCell,
      enableSorting: false,
      size: (100 / 24) * 4,
    },
    {
      accessorKey: 'supportersPile',
      header: 'Supporters',
      cell: () => PileCell,
      enableSorting: false,
      size: (100 / 24) * 4,
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

<HeadMeta title="All Drip Lists" />

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

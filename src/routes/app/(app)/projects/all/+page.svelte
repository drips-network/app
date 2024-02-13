<script lang="ts" context="module">
  import type { ProjectBadgeFragment } from '$lib/components/project-badge/__generated__/gql.generated';
  import { gql } from 'graphql-request';

  export const PROJECTS_LISTINGS_ITEM_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment ProjectsListingsItem on Project {
      ... on ClaimedProject {
        ...ProjectBadge
        splits {
          maintainers {
            account {
              accountId
            }
          }
          dependencies {
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
        }
        description
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
    }
  `;
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import Section from '$lib/components/section/section.svelte';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import ProjectBadgeCell from '$lib/components/table/cells/project-badge.cell.svelte';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { goto } from '$app/navigation';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import type { ClaimedProject } from '$lib/graphql/__generated__/base-types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';

  export let data: PageData;
  interface ProjectsTableRow {
    badge: ProjectBadgeFragment;
    description: string;
    supportersCount: number;
    dependenciesCount: number;
  }

  const projectsTableData: ProjectsTableRow[] = data.projects?.map((project: ClaimedProject) => {
    return {
      badge: project,
      description: project.description ?? '-',
      supportersCount: [
        ...new Set(
          mapFilterUndefined(
            project.support,
            (item) => 'account' in item && item.account?.accountId,
          ),
        ),
      ].length,
      dependenciesCount: [
        ...new Set([
          ...project.splits.maintainers.map((item) => item.account.accountId),
          ...project.splits.dependencies.map((item) => item.account.accountId),
        ]),
      ].length,
    } as ProjectsTableRow;
  });

  const projectsTableColumns: ColumnDef<ProjectsTableRow>[] = [
    {
      accessorKey: 'badge',
      header: 'Name',
      cell: () => ProjectBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => info.getValue(),
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'supportersCount',
      header: 'Supporters',
      cell: (info) => info.getValue(),
      enableSorting: false,
      size: (100 / 24) * 3,
    },
    {
      accessorKey: 'dependenciesCount',
      header: 'Splits with',
      cell: (info) => info.getValue(),
      enableSorting: false,
      size: (100 / 24) * 3,
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
    const source = projectsTableData[event.detail.rowIndex].badge.source;
    goto(buildProjectUrl(source.forge, source.ownerName, source.repoName, true));
  }
</script>

<article>
  <Section
    header={{
      icon: Box,
      label: 'All projects',
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
        data: projectsTableData,
        columns: projectsTableColumns,
        getCoreRowModel: getCoreRowModel(),
      }}
      isRowClickable={true}
      on:rowClick={onRowClick}
    />
  </Section>
</article>

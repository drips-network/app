<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const PROJECTS_LISTINGS_ITEM_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    ${DRIP_LIST_BADGE_FRAGMENT}
    fragment ProjectsListingsItem on Project {
      ... on ClaimedProject {
        ...ProjectBadge
        splits {
          maintainers {
            account {
              address
            }
          }
          dependencies {
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
    }
  `;
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import Section from '$lib/components/section/section.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import ProjectBadge, {
    PROJECT_BADGE_FRAGMENT,
  } from '$lib/components/project-badge/project-badge.svelte';
  import { dripListIcon, projectIcon, addressIcon } from '$lib/components/pile/pile-presets';
  import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import type { ComponentProps } from 'svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { ProjectsListingsItemFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import onClickGoto from '$lib/utils/on-click-goto';

  export let data: PageData;
  interface ProjectsTableRow {
    badge: { project: ProjectsListingsItemFragment };
    supportersPile: ComponentProps<Pile>;
    dependenciesPile: ComponentProps<Pile>;
  }

  const projectsTableData: ProjectsTableRow[] = data.content.projects
    .map((project) => {
      return {
        badge: {
          project,
          tooltip: false,
        },
        dependenciesPile: {
          maxItems: 4,
          components:
            'splits' in project
              ? [
                  ...mapFilterUndefined(project.splits.maintainers, (s) => {
                    switch (s.__typename) {
                      case 'AddressReceiver':
                        return addressIcon(s.account.address);
                    }
                  }),
                  ...mapFilterUndefined(project.splits.dependencies, (s) => {
                    switch (s.__typename) {
                      case 'DripListReceiver':
                        return dripListIcon(s.dripList);
                      case 'ProjectReceiver':
                        return projectIcon(s.project);
                      case 'AddressReceiver':
                        return addressIcon(s.account.address);
                    }
                  }),
                ]
              : [],
        },
        supportersPile: {
          maxItems: 4,
          components:
            'support' in project
              ? mapFilterUndefined(project.support, (s) => {
                  switch (s.__typename) {
                    case 'DripListSupport':
                      return dripListIcon(s.dripList);
                    case 'ProjectSupport':
                      return projectIcon(s.project);
                    case 'OneTimeDonationSupport':
                      return addressIcon(s.account.address);
                  }
                })
              : [],
        },
      } as ProjectsTableRow;
    })
    .sort((a, b) => b.dependenciesPile.components.length - a.dependenciesPile.components.length);

  const projectsTableColumns: ColumnDef<ProjectsTableRow>[] = [
    {
      accessorKey: 'badge',
      header: 'Name',
      cell: () => ProjectBadge,
      enableSorting: false,
      size: (100 / 24) * 11,
    },
    {
      accessorKey: 'dependenciesPile',
      header: 'Drips to',
      cell: () => Pile,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'supportersPile',
      header: 'Supporters',
      cell: () => Pile,
      enableSorting: false,
      size: (100 / 24) * 5,
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
    const { project } = projectsTableData[event.detail.rowIndex].badge;
    if (!isClaimed(project)) return;

    const { source } = project;

    onClickGoto(
      buildProjectUrl(source.forge, source.ownerName, source.repoName, true),
      event.detail.event,
    );
  }
</script>

<HeadMeta title="All Projects" />

<article>
  <Section
    header={{
      icon: Box,
      label: 'All Projects',
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

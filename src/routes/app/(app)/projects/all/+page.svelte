<script lang="ts">
  import type { PageData } from './$types';
  import Section from '$lib/components/section/section.svelte';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  // import ProjectBadgeCell from '$lib/components/table/cells/project-badge.cell.svelte'
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import Table from '$lib/components/table/table.svelte';

  export let data: PageData;

  interface ProjectsTableRow {
    name: string;
    description: string;
    supporters: number;
    dependencies: number;
  }

  let projectsTableData: ProjectsTableRow[] = [
    {
      name: 'one',
      description: 'bla',
      supporters: 130,
      dependencies: 10,
    },
    {
      name: 'two',
      description: 'bla bla',
      supporters: 10,
      dependencies: 130,
    },
  ];

  const projectsTableColumns: ColumnDef<ProjectsTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      // cell: () => ProjectBadgeCell,
      cell: (info) => info.getValue(),
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
      accessorKey: 'supporters',
      header: 'Supporters',
      cell: (info) => info.getValue(),
      enableSorting: false,
      size: (100 / 24) * 3,
    },
    {
      accessorKey: 'dependencies',
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
</script>

<article>
  <Section
    header={{
      icon: Box,
      label: 'All projects',
    }}
    skeleton={{
      horizontalScroll: false,
      loaded: true,
      empty: false,
      error: false,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'Nothing to see here',
      emptyStateText: "Couldn't fetch projects from the server",
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
    />
  </Section>
</article>

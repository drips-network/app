<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';
  import EcosystemDistributionProject from './ecosystem-distribution-project.svelte';
  import EcosystemDistributionWeight from './ecosystem-distribution-weight.svelte';
  import EcosystemDistributionDependencies from './ecosystem-distribution-dependencies.svelte';
  import formatNumber from '$lib/utils/format-number';

  export let ecosystem: Ecosystem;
  export let full: boolean = false;

  interface DistributionTableRow {
    projectProps: ComponentProps<EcosystemDistributionProject>;
    weightProps: ComponentProps<EcosystemDistributionWeight>;
    dependenciesProps: ComponentProps<EcosystemDistributionDependencies>;
  }

  const ROW_COUNT = full ? Infinity : 6;
  const tableData: DistributionTableRow[] = ecosystem.graph.nodes
    .sort((a, b) => b.absoluteWeight - a.absoluteWeight)
    .slice(0, ROW_COUNT)
    .map((node) => {
      const dependencies = ecosystem.graph.edges.filter(
        (edge) => edge.source === node.projectAccountId,
      );
      return {
        projectProps: {
          repoOwner: node.repoOwner,
          repoName: node.repoName,
        },
        weightProps: {
          weight: node.absoluteWeight,
        },
        dependenciesProps: {
          numDependencies: dependencies.length,
        },
      };
    });

  const tableColumns: ColumnDef<DistributionTableRow>[] = [
    {
      accessorKey: 'projectProps',
      header: 'Project',
      cell: () => EcosystemDistributionProject,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'weightProps',
      header: 'Percentage of Ecosystem Funds',
      cell: () => EcosystemDistributionWeight,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'dependenciesProps',
      header: 'Dependencies',
      cell: () => EcosystemDistributionDependencies,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
  ];

  $: restCount = formatNumber(ecosystem.graph.nodes.length - ROW_COUNT);
</script>

<div class="ecosystem-distribution">
  <Section
    header={{
      icon: DripList,
      label: 'Distribution details',
      actions: [
        ...(!full
          ? [
              {
                label: 'View all',
                href: `/app/ecosystems/${ecosystem.id}/distribution`,
              },
            ]
          : []),
      ],
    }}
    skeleton={{
      loaded: true,
    }}
  >
    <Table
      rowHeight={76}
      options={{
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
      }}
    />
    {#if !full}
      <div class="shadow-rest">{restCount} more…</div>
    {/if}
  </Section>
</div>

<style>
  .ecosystem-distribution {
    position: relative;
  }

  .shadow-rest {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: end;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, var(--color-background) 100%);
    height: 218px;
    padding: 1.5rem;
  }
</style>

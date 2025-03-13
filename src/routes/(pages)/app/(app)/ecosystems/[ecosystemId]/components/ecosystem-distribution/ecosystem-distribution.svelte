<script lang="ts">
  // import Button from '$lib/components/button/button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  // import EcosystemSplit from './ecosystem-split.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';
  import EcosystemDistributionProject from './ecosystem-distribution-project.svelte';
  import EcosystemDistributionWeight from './ecosystem-distribution-weight.svelte';
  import EcosystemDistributionDependencies from './ecosystem-distribution-dependencies.svelte';

  export let ecosystem: Ecosystem;

  interface DistributionTableRow {
    projectProps: ComponentProps<EcosystemDistributionProject>;
    weightProps: ComponentProps<EcosystemDistributionWeight>;
    dependenciesProps: ComponentProps<EcosystemDistributionDependencies>;
  }

  const tableData: DistributionTableRow[] = ecosystem.graph.nodes
    .sort((a, b) => b.absoluteWeight - a.absoluteWeight)
    .slice(0, 10)
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
</script>

<div class="ecosystem-distribution">
  <Section
    header={{
      icon: DripList,
      label: 'Distribution details',
      actions: [
        {
          label: 'View all',
          href: `/app/ecosystems/${ecosystem.id}/distribution`,
        },
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
    <!-- <div class="horizontal-scroll">
      <ProjectsGrid projects={featuredWeb3Projects} />
    </div> -->
  </Section>
  <!-- <div class="header">
    <h4 class="typo-header-4">
      <DripList style="fill: var(--color-primary)" />Distribution details
    </h4>
  </div> -->
  <!-- <div class="splits">
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
    <EcosystemSplit />
  </div>
  <div class="actions">
    <Button>Load more</Button>
  </div> -->
</div>

<style>
</style>

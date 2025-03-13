<script lang="ts">
  // import Button from '$lib/components/button/button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  // import EcosystemSplit from './ecosystem-split.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';

  export let ecosystem: Ecosystem;

  interface DistributionTableRow {
    name: string;
    ecosystemFunds: number;
    dependencies: number;
  }

  const tableData: DistributionTableRow[] = ecosystem.graph.nodes
    .sort((a, b) => b.absoluteWeight - a.absoluteWeight)
    .slice(0, 10)
    .map((node) => {
      const dependencies = ecosystem.graph.edges.filter(
        (edge) => edge.source === node.projectAccountId,
      );
      return {
        name: `${node.repoOwner}/${node.repoName}`,
        ecosystemFunds: node.absoluteWeight,
        dependencies: dependencies.length,
      };
    });

  // tableData =

  const tableColumns: ColumnDef<DistributionTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Project',
      cell: (...stuff) => stuff,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'ecosystemFunds',
      header: 'Percentage of Ecosystem Funds',
      cell: (...stuff) => stuff,
      enableSorting: true,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'dependencies',
      header: 'Dependencies',
      cell: (...stuff) => stuff,
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

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import EcosystemSplit from './ecosystem-split.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';

  export let ecosystem: Ecosystem;
</script>

<div class="card ecosystem-distribution">
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
    <!-- <div class="horizontal-scroll">
      <ProjectsGrid projects={featuredWeb3Projects} />
    </div> -->
  </Section>
  <div class="header">
    <h4 class="typo-header-4">
      <DripList style="fill: var(--color-primary)" />Distribution details
    </h4>
  </div>
  <div class="splits">
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
  </div>
</div>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1.5rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    overflow-x: scroll;
    text-align: left;
  }

  h4 {
    color: var(--color-primary);
    margin-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .splits {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .actions {
    text-align: center;
  }

  @media (max-width: 768px) {
    .splits {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>

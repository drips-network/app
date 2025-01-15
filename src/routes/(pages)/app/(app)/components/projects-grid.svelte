<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import isClaimed from '$lib/utils/project/is-claimed';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import getProjectColor from './project-color';

  export let projects: DefaultExplorePageFeaturedProjectFragment[];
</script>

<div class="projects-grid">
  {#each projects as project}
    <div>
      {#if isClaimed(filterCurrentChainData(project.chainData))}
        <PrimaryColorThemer colorHex={getProjectColor(project)}>
          <ProjectCard {project} />
        </PrimaryColorThemer>
      {/if}
    </div>
  {/each}
</div>

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 4px;
  }

  @media (max-width: 767px) {
    .projects-grid {
      display: flex;
      gap: 1rem;
      padding: 4px;
    }

    .projects-grid > div {
      width: 14rem;
    }
  }
</style>

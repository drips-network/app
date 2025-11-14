<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import isClaimed from '$lib/utils/project/is-claimed';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import getProjectColor from './project-color';

  interface Props {
    projects: DefaultExplorePageFeaturedProjectFragment[];
  }

  let { projects }: Props = $props();
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
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: 1rem 1.5rem;
    max-width: 100%;
    position: relative;
    padding: 4px;
  }
</style>

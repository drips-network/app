<script lang="ts" context="module">
  export const DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment DefaultExplorePageFeaturedProject on Project {
      ...ProjectCard
      account {
        accountId
      }
      chainData {
        ... on ClaimedProjectData {
          chain
        }
        ... on UnClaimedProjectData {
          chain
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import isClaimed from '$lib/utils/project/is-claimed';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import getProjectColor from './project-color';
  import ProjectCard, {
    PROJECT_CARD_FRAGMENT,
  } from '$lib/components/project-card/project-card.svelte';
  import { gql } from 'graphql-request';

  export let projects: DefaultExplorePageFeaturedProjectFragment[];

  $: projectsWithoutJasonTests = projects.filter(
    (p) => !p.source.repoName.includes('drips-test-repo'),
  );

  $: recentlyClaimedProjects = projectsWithoutJasonTests.slice(-4).filter((p) => p.isVisible);
</script>

<Section
  header={{
    icon: BoxIcon,
    label: 'Recently claimed projects',
    actions: [
      {
        label: 'See all',
        href: '/app/projects/all',
        icon: Box,
      },
    ],
  }}
  skeleton={{ loaded: true }}
>
  <div class="projects-grid">
    {#each recentlyClaimedProjects as project}
      <div>
        {#if isClaimed(filterCurrentChainData(project.chainData))}
          <PrimaryColorThemer colorHex={getProjectColor(project)}>
            <ProjectCard {project} />
          </PrimaryColorThemer>
        {/if}
      </div>
    {/each}
  </div>
</Section>

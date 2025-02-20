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
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import { PROJECT_CARD_FRAGMENT } from '$lib/components/project-card/project-card.svelte';
  import { gql } from 'graphql-request';
  import ProjectsGrid from './projects-grid.svelte';

  export let projects: DefaultExplorePageFeaturedProjectFragment[];

  $: projectsWithoutJasonTests = projects.filter(
    (p) => !p.source.repoName.includes('drips-test-repo'),
  );

  $: recentlyClaimedProjects = projectsWithoutJasonTests.slice(-4).filter((p) => p.isVisible);
</script>

{#if recentlyClaimedProjects.length > 0}
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
    <ProjectsGrid projects={recentlyClaimedProjects} />
  </Section>
{/if}

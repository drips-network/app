<script lang="ts" context="module">
  export const PROJECTS_SECTION_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment ProjectsSectionProject on Project {
      ...ProjectCard
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import ProjectCard, { PROJECT_CARD_FRAGMENT } from '../project-card/project-card.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import Section from '../section/section.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectsSectionProjectFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import Plus from '../icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import VisibilityToggle from '../visibility-toggle/visibility-toggle.svelte';

  export let projects: ProjectsSectionProjectFragment[];
  export let withClaimProjectButton = false;

  let error = false;

  export let collapsed = false;
  export let collapsable = false;

  let showHidden: boolean = false;
  $: hiddenProjectsCount = projects.filter((p) => !p.isVisible).length ?? 0;

  $: projectsToShow = [
    ...(showHidden ? projects : projects.filter((p) => p.isVisible))
      // Show hidden projects last.
      .sort((a, b) => {
        if (showHidden && 'isVisible' in a && 'isVisible' in b) {
          return a.isVisible === b.isVisible ? 0 : a.isVisible ? -1 : 1;
        }
        return 0;
      }),
  ];
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Box,
    label: 'Projects',
    actions: withClaimProjectButton
      ? [
          {
            label: 'Claim project',
            icon: Plus,
            handler: () => modal.show(ClaimProjectStepper, undefined, { skipWalletConnect: true }),
          },
        ]
      : [],
  }}
  skeleton={{
    horizontalScroll: false,
    loaded: true,
    empty: projects?.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No claimed projects',
    emptyStateText: withClaimProjectButton
      ? 'If you develop an open-source project, click "Claim project" to get started.'
      : 'This user hasnʼt claimed any software projects yet.',
  }}
>
  {#if projectsToShow}
    <div class="projects">
      {#each projectsToShow as project}
        {@const projectChainData = filterCurrentChainData(project.chainData)}
        {#if isClaimed(projectChainData)}
          <div>
            <PrimaryColorThemer colorHex={projectChainData.color}>
              <ProjectCard {project} isHidden={!project.isVisible} />
            </PrimaryColorThemer>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <svelte:fragment slot="left-actions">
    <VisibilityToggle bind:showHidden hiddenItemsCount={hiddenProjectsCount}></VisibilityToggle>
  </svelte:fragment>
</Section>

<style>
  .projects {
    display: flex;
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 2px;
    flex-wrap: wrap;
  }

  .projects > * {
    flex: 1;
    min-width: 16rem;
    max-width: calc(25% - 0.75rem);
  }

  @media (max-width: 560px) {
    .projects > * {
      width: 100%;
      max-width: 100%;
    }
  }
</style>

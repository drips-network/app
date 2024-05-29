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
  // import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';

  export let projects: ProjectsSectionProjectFragment[];
  export let withClaimProjectButton = false;

  let error = false;

  export let collapsed = false;
  export let collapsable = false;
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Box,
    label: 'Projects',
    actions: withClaimProjectButton
      ? [
          // {
          //   // TODO: (FIX) clicking this button after completing the claim project flow freezes the UI (in all browsers). It shouldnʼt.  😊
          //   label: 'Claim project',
          //   icon: Plus,
          //   handler: () => modal.show(ClaimProjectStepper, undefined, { skipWalletConnect: true }),
          // },
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
  {#if projects}
    <div class="projects">
      {#each projects as project}
        {#if isClaimed(project)}
          <div>
            <PrimaryColorThemer colorHex={project.color}>
              <ProjectCard {project} />
            </PrimaryColorThemer>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
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

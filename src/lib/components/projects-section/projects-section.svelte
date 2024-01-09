<script lang="ts">
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import ProjectCard, { PROJECT_CARD_FRAGMENT } from '../project-card/project-card.svelte';
  import assert from '$lib/utils/assert';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Section from '../section/section.svelte';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import type { ProjectsQuery, ProjectsQueryVariables } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import modal from '$lib/stores/modal';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';

  export let address: string | undefined;

  let projects: ProjectsQuery['projects'] | undefined;
  let error = false;
  let loaded = false;

  export let collapsed = false;
  export let collapsable = false;

  async function updateProjects() {
    try {
      assert(address);

      const getProjectsQuery = gql`
        ${PROJECT_CARD_FRAGMENT}
        query Projects($where: ProjectWhereInput) {
          projects(where: $where) {
            ...ProjectCard
          }
        }
      `;

      const response = await query<ProjectsQuery, ProjectsQueryVariables>(getProjectsQuery, {
        where: {
          ownerAddress: address,
        },
      });
      projects = response.projects;

      loaded = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      loaded = true;
      error = true;
    }
  }

  $: address && updateProjects();

  $: isSelf = address && address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Box,
    label: 'Projects',
    actions: isSelf
      ? [
          {
            // TODO: (FIX) clicking this button after completing the claim project flow freezes the UI (in all browsers). It shouldnʼt.  😊
            // handler: () => goto(`/app/claim-project`),
            label: 'Claim project',
            icon: Plus,
            variant: 'primary',
            handler: () => modal.show(ClaimProjectStepper, undefined, { skipWalletConnect: true }),
          },
        ]
      : [],
  }}
  skeleton={{
    horizontalScroll: false,
    loaded,
    empty: projects?.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No claimed projects',
    emptyStateText: isSelf
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

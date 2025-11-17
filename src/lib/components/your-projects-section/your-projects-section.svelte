<script lang="ts" module>
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
  import Plus from '../icons/Plus.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import VisibilityToggle from '../visibility-toggle/visibility-toggle.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import launchClaimProject from '$lib/utils/launch-claim-project';

  let error = false;

  interface Props {
    projects: ProjectsSectionProjectFragment[];
    withClaimProjectButton?: boolean;
    showVisibilityToggle?: boolean;
    collapsed?: boolean;
    collapsable?: boolean;
  }

  let {
    projects,
    withClaimProjectButton = false,
    showVisibilityToggle = false,
    collapsed = $bindable(false),
    collapsable = $bindable(false),
  }: Props = $props();

  let showHidden: boolean = $state(false);
  let hiddenProjectsCount = $derived(projects.filter((p) => !p.isVisible).length ?? 0);

  let visibleProjects = $derived(projects.filter((p) => p.isVisible));

  let hiddenProjects = $derived(showHidden ? projects.filter((p) => !p.isVisible) : []);

  let isOwner = $derived(
    $walletStore.connected && checkIsUser(projects[0]?.chainData[0]?.owner?.accountId),
  );
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Box,
    label: 'Your projects',
    actions: withClaimProjectButton
      ? [
          {
            label: 'Claim project',
            icon: Plus,
            handler: () => launchClaimProject(),
          },
        ]
      : [],
  }}
  skeleton={{
    horizontalScroll: false,
    loaded: true,
    empty: showVisibilityToggle ? projects?.length === 0 : visibleProjects?.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No claimed projects',
    emptyStateText: withClaimProjectButton
      ? 'If you develop an open-source project, click "Claim project" to get started.'
      : 'This user hasnʼt claimed any software projects yet.',
    disconnected: !$walletStore.connected,
    disconnectedStateEmoji: '🫙',
    disconnectedStateHeadline: 'Connect your wallet',
    disconnectedStateText: 'Your claimed projects will show up here when your wallet is connected.',
  }}
>
  {#if visibleProjects}
    <div class="projects">
      {#each visibleProjects as project}
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

  {#if isOwner && showVisibilityToggle}
    <VisibilityToggle bind:showHidden hiddenItemsCount={hiddenProjectsCount} />
  {/if}

  <div class="projects">
    {#each hiddenProjects as project}
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
    width: calc(50% - 0.5rem);
  }

  @media (max-width: 560px) {
    .projects > * {
      width: 100%;
      max-width: 100%;
    }
  }
</style>

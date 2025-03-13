<!-- <script lang="ts" context="module">
  export const PROJECTS_SECTION_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment ProjectsSectionProject on Project {
      ...ProjectCard
    }
  `;
</script> -->

<script lang="ts">
  // import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  // import ProjectCard, { PROJECT_CARD_FRAGMENT } from '../project-card/project-card.svelte';
  // import Box from '$lib/components/icons/Box.svelte';
  // import Section from '../section/section.svelte';
  // import { gql } from 'graphql-request';
  // import type { ProjectsSectionProjectFragment } from './__generated__/gql.generated';
  // import isClaimed from '$lib/utils/project/is-claimed';
  // import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  // import Plus from '$lib/components/icons/Plus.svelte';
  // import modal from '$lib/stores/modal';
  // import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  // import VisibilityToggle from '../visibility-toggle/visibility-toggle.svelte';
  // import checkIsUser from '$lib/utils/check-is-user';
  // import walletStore from '$lib/stores/wallet/wallet.store';
  // import ProjectCard, { PROJECT_CARD_FRAGMENT } from '$lib/components/project-card/project-card.svelte';
  import Section from '$lib/components/section/section.svelte';
  // import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  // import VisibilityToggle from '$lib/components/visibility-toggle/visibility-toggle.svelte';
  // import EcosystemCard, { PROJECT_CARD_FRAGMENT } from './ecosystem-card.svelte';
  import EcosystemsGrid from './ecosystems-grid.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  // import { PROJECT_CARD_FRAGMENT } from './ecosystem-card.svelte';

  export let ecosystems: Ecosystem[];

  let error = false;

  export let collapsed = false;
  export let collapsable = false;

  // let showHidden: boolean = false;
  // $: hiddenProjectsCount = projects.filter((p) => !p.isVisible).length ?? 0;

  // $: visibleProjects = ecosystems.filter((p) => p.isVisible);

  // $: hiddenProjects = showHidden ? projects.filter((p) => !p.isVisible) : [];

  // $: isOwner = $walletStore.connected && checkIsUser(projec ts[0]?.chainData[0]?.owner?.accountId);
</script>

<Section
  bind:collapsed
  bind:collapsable
  skeleton={{
    horizontalScroll: false,
    loaded: true,
    empty: ecosystems.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No ecosystems',
    emptyStateText: 'Create an ecosystem to get started.',
  }}
>
  {#if ecosystems}
    <EcosystemsGrid big {ecosystems} />
    <!-- <div class="projects">
      {#each visibleProjects as project}
        {@const projectChainData = filterCurrentChainData(project.chainData)}
        {#if isClaimed(projectChainData)}
          <div>
            <PrimaryColorThemer colorHex={projectChainData.color}>
              <EcosystemCard {project} isHidden={!project.isVisible} />
            </PrimaryColorThemer>
          </div>
        {/if}
      {/each}
    </div> -->
  {/if}

  <!-- {#if isOwner && showVisibilityToggle}
    <VisibilityToggle bind:showHidden hiddenItemsCount={hiddenProjectsCount} />
  {/if} -->

  <!-- <div class="projects">
    {#each hiddenProjects as project}
      {@const projectChainData = filterCurrentChainData(project.chainData)}
      {#if isClaimed(projectChainData)}
        <div>
          <PrimaryColorThemer colorHex={projectChainData.color}>
            <EcosystemCard {project} isHidden={!project.isVisible} />
          </PrimaryColorThemer>
        </div>
      {/if}
    {/each}
  </div> -->
</Section>

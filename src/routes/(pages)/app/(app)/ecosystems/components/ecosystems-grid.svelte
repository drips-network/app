<script lang="ts" context="module">
  export const PROJECTS_SECTION_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment ProjectsSectionProject on Project {
      ...ProjectCard
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import isClaimed from '$lib/utils/project/is-claimed';
  import type { ProjectsSectionProjectFragment } from './__generated__/gql.generated';
  import EcosystemCard, { PROJECT_CARD_FRAGMENT } from './ecosystem-card.svelte';
  import { gql } from 'graphql-request';

  export let ecosystems: ProjectsSectionProjectFragment[];
</script>

<div class="ecosystems-grid">
  {#each ecosystems as ecosystem}
    {@const projectChainData = filterCurrentChainData(ecosystem.chainData)}
    {#if isClaimed(projectChainData)}
      <PrimaryColorThemer colorHex={projectChainData.color}>
        <EcosystemCard project={ecosystem} isHidden={!ecosystem.isVisible} />
      </PrimaryColorThemer>
      <PrimaryColorThemer colorHex={projectChainData.color}>
        <EcosystemCard project={ecosystem} isHidden={!ecosystem.isVisible} />
      </PrimaryColorThemer>
      <PrimaryColorThemer colorHex={projectChainData.color}>
        <EcosystemCard project={ecosystem} isHidden={!ecosystem.isVisible} />
      </PrimaryColorThemer>
    {/if}
  {/each}
</div>

<style>
  .ecosystems-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 2px;
  }

  /* .ecosystems-grid > * {
    flex: 1;
    min-width: 16rem;
    max-width: calc(50% - 0.75rem);
    width: calc(25% - 0.75rem);
  } */

  @media (max-width: 560px) {
    /* .ecosystems-grid > * {
      width: 100%;
      max-width: 100%;
    } */
  }
</style>

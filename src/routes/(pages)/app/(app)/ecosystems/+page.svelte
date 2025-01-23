<script lang="ts" context="module">
  export const PROJECTS_PAGE_PROJECT_FRAGMENT = gql`
    ${PROJECTS_SECTION_PROJECT_FRAGMENT}
    fragment ProjectsPageProject on Project {
      ...ProjectsSectionProject
    }
  `;
</script>

<script lang="ts">
  // import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  // import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  // import SplittingGraph from '$lib/components/illustrations/splitting-graph.svelte';
  // import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  // import CrossIcon from '$lib/components/icons/Cross.svelte';
  // import { fade } from 'svelte/transition';
  import { PROJECTS_SECTION_PROJECT_FRAGMENT } from '$lib/components/projects-section/projects-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  // import YourEcosystemsSection from './components/your-ecosystems-section.svelte';
  import AllEcosystemsSection from './components/all-ecosystems-section.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Ecosystem from '$lib/components/illustrations/ecosystem.svelte';
  import EduCardIllustration from '$lib/components/edu-card/edu-card-illustration.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';

  export let data;

  $: {
    $walletStore.connected;
    guardConnected();
  }
</script>

<HeadMeta title="Ecosystems" />

<div class="page">
  <EduCard dismissableId="ecosystems-page-intro" negativeMarginWhileCollapsed="-4rem">
    <svelte:fragment slot="text">
      <h1 class="pixelated">Ecosystems</h1>
      <p>
        Ecosystems are large collections of claimed and unclaimed projects networked together using
        Drips AI. Sending funds to a single ecosystem is an efficient way to easily fund hundreds of
        projects at once, supporting a whole community in one go.
      </p>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button icon={ArrowBoxUpRight}>Learn more</Button>
    </svelte:fragment>
    <svelte:fragment slot="illustration">
      <EduCardIllustration>
        <Ecosystem />
      </EduCardIllustration>
    </svelte:fragment>
  </EduCard>
  <!-- <div class="section">
    {#if data.projects}
      <YourEcosystemsSection
        withClaimProjectButton
        projects={data.projects}
        showVisibilityToggle={true}
      />
    {/if}
  </div> -->

  <div class="section">
    {#if data.projects}
      <AllEcosystemsSection
        withClaimProjectButton
        projects={data.projects}
        showVisibilityToggle={true}
      />
    {/if}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  /* .card {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    position: relative;
  }

  .card:not(:last-child) {
    margin-bottom: 1rem;
  }

  button:disabled {
    opacity: 0.5;
  }

  .splitting-graph-edu.card {
    display: flex;
    gap: 2rem;
    padding-right: 2rem;
    align-items: center;
  }

  .splitting-graph-edu.card .content {
    display: flex;
    flex-direction: column;
    align-items: start;
    max-width: 40rem;
    gap: 1rem;
  }

  .splitting-graph-edu.card .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    transition: background-color 0.3s;
    border-radius: 1rem;
  }

  .splitting-graph-edu.card .close-button:focus-visible {
    background-color: var(--color-foreground-level-2);
  }

  @media (max-width: 716px) {
    .splitting-graph-edu.card {
      flex-direction: column;
    }

    .splitting-graph-edu.card .illustration {
      display: none;
    }

    .splitting-graph-edu.card .content {
      padding: 1rem;
    }
  } */

  /* TODO: put within educard */
  /* .edu-card-illustration-bg {
    position: absolute;
    background-color: var(--color-primary-level-2);
    top: 0;
    width: 35%;
    height: 50%;
    border-radius: 0 0 1rem 1rem;
  }

  .edu-card-illustration-wrapper {
    max-width: 16rem;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
    }
  } */
</style>

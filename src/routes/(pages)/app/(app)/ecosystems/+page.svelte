<script lang="ts" context="module">
  export const PROJECTS_PAGE_PROJECT_FRAGMENT = gql`
    ${PROJECTS_SECTION_PROJECT_FRAGMENT}
    fragment ProjectsPageProject on Project {
      ...ProjectsSectionProject
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import SplittingGraph from '$lib/components/illustrations/splitting-graph.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import CrossIcon from '$lib/components/icons/Cross.svelte';
  import { fade } from 'svelte/transition';
  import ProjectsSection, {
    PROJECTS_SECTION_PROJECT_FRAGMENT,
  } from '$lib/components/projects-section/projects-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  import YourEcosystemsSection from './components/your-ecosystems-section.svelte';
  import AllEcosystemsSection from './components/all-ecosystems-section.svelte';

  export let data;

  $: {
    $walletStore.connected;
    guardConnected();
  }
</script>

<HeadMeta title="Ecosystems" />

<div class="page">

  <div class="section">
    {#if data.projects}
      <YourEcosystemsSection
        withClaimProjectButton
        projects={data.projects}
        showVisibilityToggle={true}
      />
    {/if}
  </div>

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

  .card {
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
  }
</style>

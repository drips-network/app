<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import SplittingGraph from '$lib/components/illustrations/splitting-graph.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import CrossIcon from 'radicle-design-system/icons/Cross.svelte';
  import { fade } from 'svelte/transition';
  import ProjectsSection from '$lib/components/projects-section/projects-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  $: {
    $walletStore.connected;
    guardConnected();
  }
</script>

<HeadMeta title="Projects" />

<div class="page">
  {#if !$dismissablesStore.includes('splitting-graph-edu-card')}
    <div class="edu-card-wrapper">
      <div transition:fade|local={{ duration: 300 }} class="splitting-graph-edu card">
        <div class="illustration">
          <SplittingGraph />
        </div>
        <div class="content">
          <div style:display="flex" style:gap="0.5rem" style:flex-direction="column">
            <h2 class="pixelated">How donations reach your projects</h2>
            <p>
              Donations from supporters are automatically trickled down a global dependency tree
              once a month.
            </p>
          </div>
          <Button href="https://docs.drips.network/" target="_blank" icon={ArrowBoxUpRight}>
            Learn more
          </Button>
        </div>
        <button
          class="close-button"
          on:click={() => dismissablesStore.dismiss('splitting-graph-edu-card')}
        >
          <CrossIcon />
        </button>
      </div>
    </div>
  {/if}

  <div class="section">
    <ProjectsSection address={$walletStore.address} />
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

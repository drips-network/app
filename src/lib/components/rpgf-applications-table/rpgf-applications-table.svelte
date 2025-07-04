<script lang="ts">
  import type {
    Application,
    InProgressBallot,
    WrappedRoundAdmin,
    WrappedRoundPublic,
  } from '$lib/utils/rpgf/schemas';
  import { writable, type Writable } from 'svelte/store';
  import ApplicationLineItem from './components/application-line-item.svelte';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import MagnifyingGlass from '../icons/MagnifyingGlass.svelte';
  import Cross from '../icons/Cross.svelte';

  export let searchable = true;

  export let applications: Application[];
  export let round: WrappedRoundPublic['round'] | WrappedRoundAdmin['round'];

  export let reviewMode = false;
  export let decisions: Record<string, 'approve' | 'reject' | null> = {};

  export let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot> = writable({});

  let searchQuery = '';

  $: filteredApplications = applications.filter((application) => {
    return (
      !searchQuery || application.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  $: includesResults = applications.some((a) => a.result !== null);
</script>

{#if searchable}
  <div class="search-bar" class:active={searchQuery}>
    <MagnifyingGlass />
    <input bind:value={searchQuery} placeholder="Search applications" type="text" />
    {#if searchQuery}
      <button on:click={() => (searchQuery = '')} aria-label="Clear search">
        <Cross />
      </button>
    {/if}
  </div>
{/if}

<PaddedHorizontalScroll>
  <div class="wrapper">
    <div class="table-wrapper">
      {#if includesResults}
        <div class="applications-table-header">
          <h5>Project name</h5>
          <h5>Vote result</h5>
        </div>
      {/if}
      <div class="applications-table">
        {#each filteredApplications as application (application.id)}
          <ApplicationLineItem
            {voteStep}
            {ballotStore}
            {reviewMode}
            {round}
            {application}
            bind:decision={decisions[application.id]}
          />
        {/each}
        {#if applications.length === 0}
          <div class="empty">Nothing to see here</div>
        {/if}
      </div>
    </div>
  </div>
</PaddedHorizontalScroll>

<style>
  .search-bar {
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    gap: 0.5rem;
    transition: box-shadow 0.3s;
  }

  .search-bar.active {
    box-shadow: var(--elevation-medium);
  }

  .search-bar input {
    border: none;
    background: transparent;
    color: var(--color-foreground);
    width: 100%;
    outline: none;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .applications-table-header {
    display: flex;
    justify-content: space-between;
    padding: 0 0.5rem;
  }

  .table-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .applications-table {
    display: flex;
    flex-direction: column;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    overflow: hidden;
  }

  .empty {
    padding: 5rem 1rem;
    text-align: center;
    color: var(--color-foreground-level-5);
  }
</style>

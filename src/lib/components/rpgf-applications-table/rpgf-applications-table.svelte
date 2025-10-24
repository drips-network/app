<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import MagnifyingGlass from '../icons/MagnifyingGlass.svelte';
  import Cross from '../icons/Cross.svelte';
  import type { ListingApplication } from '$lib/utils/rpgf/types/application';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import ApplicationsTable from './components/applications-table.svelte';

  export let searchable = true;

  export let applications: ListingApplication[];
  export let round: Round;
  export let signedIn: boolean;

  export let reviewMode = false;
  export let decisions: Record<string, 'approve' | 'reject' | null> = {};

  export let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot> = writable({});

  export let horizontalScroll = false;

  let searchQuery = '';

  $: filteredApplications = applications.filter((application) => {
    return (
      !searchQuery || application.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  $: includesResults = applications.some((a) => a.allocation !== null);
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

{#if horizontalScroll}
  <PaddedHorizontalScroll>
    <ApplicationsTable
      {includesResults}
      {applications}
      {filteredApplications}
      {voteStep}
      {ballotStore}
      {reviewMode}
      {round}
      {signedIn}
      bind:decisions
    />
  </PaddedHorizontalScroll>
{:else}
  <ApplicationsTable
    {includesResults}
    {applications}
    {filteredApplications}
    {voteStep}
    {ballotStore}
    {reviewMode}
    {round}
    {signedIn}
    bind:decisions
    ellipsis={true}
  />
{/if}

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
</style>

<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import MagnifyingGlass from '../icons/MagnifyingGlass.svelte';
  import Cross from '../icons/Cross.svelte';
  import type { ListingApplication } from '$lib/utils/rpgf/types/application';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import ApplicationsTable from './components/applications-table.svelte';

  interface Props {
    searchable?: boolean;
    applications: ListingApplication[];
    round: Round;
    signedIn: boolean;
    hideState?: boolean;
    reviewMode?: boolean;
    decisions?: Record<string, 'approve' | 'reject' | null>;
    voteStep?: 'build-ballot' | 'assign-votes' | null;
    ballotStore?: Writable<InProgressBallot>;
    displayVisibilityNote?: boolean;
  }

  let {
    searchable = true,
    applications,
    round,
    signedIn,
    hideState = false,
    reviewMode = false,
    decisions = $bindable({}),
    voteStep = null,
    ballotStore = writable({}),
    displayVisibilityNote = false,
  }: Props = $props();

  let searchQuery = $state('');

  let filteredApplications = $derived(
    applications.filter((application) => {
      return (
        !searchQuery || application.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
  );

  let hasNonApproved = $derived(applications.some((a) => a.state !== 'approved'));

  let shouldHideState = $derived(hideState || (!hasNonApproved && !reviewMode));

  let includesResults = $derived(applications.some((a) => a.allocation !== null));
</script>

{#if searchable}
  <div class="search-bar" class:active={searchQuery}>
    <MagnifyingGlass />
    <input bind:value={searchQuery} placeholder="Search applications" type="text" />
    {#if searchQuery}
      <button onclick={() => (searchQuery = '')} aria-label="Clear search">
        <Cross />
      </button>
    {/if}
  </div>
{/if}

<ApplicationsTable
  {includesResults}
  {applications}
  {filteredApplications}
  {voteStep}
  {ballotStore}
  {reviewMode}
  {round}
  {signedIn}
  {displayVisibilityNote}
  bind:decisions
  hideState={shouldHideState}
/>

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

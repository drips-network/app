<script lang="ts" context="module">
  export enum GroupBy {
    None = 'none',
    Mine = 'mine',
    State = 'state',
  }
</script>

<script lang="ts">
  import type {
    Application,
    InProgressBallot,
    WrappedRoundAdmin,
    WrappedRoundPublic,
  } from '$lib/utils/rpgf/schemas';
  import type { RpgfUserData } from '$lib/utils/rpgf/siwe';
  import { writable, type Writable } from 'svelte/store';
  import ApplicationLineItem from './components/application-line-item.svelte';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import MagnifyingGlass from '../icons/MagnifyingGlass.svelte';
  import Cross from '../icons/Cross.svelte';

  export let searchable = true;

  export let userData: RpgfUserData | null;
  export let applications: Application[];
  export let round: WrappedRoundPublic['round'] | WrappedRoundAdmin['round'];

  $: ownUserId = userData?.userId;

  export let reviewMode = false;
  export let decisions: Record<string, 'approve' | 'reject' | null> = {};

  export let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot> = writable({});

  export let groupBy: GroupBy;

  let groups: { title: string | null; applications: Application[] }[] = [];

  function populateGroups(
    apps: typeof applications,
    gb: typeof groupBy,
    searchTerm: string | undefined | null = '',
  ) {
    if (searchTerm) {
      groups = [
        {
          title: null,
          applications: apps.filter((app) =>
            app.projectName.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        },
      ];

      return;
    }

    if (gb === 'state') {
      groups = [
        {
          title: 'Pending review',
          applications: apps.filter((app) => app.state === 'pending'),
        },
        { title: 'Approved', applications: apps.filter((app) => app.state === 'approved') },
        { title: 'Rejected', applications: apps.filter((app) => app.state === 'rejected') },
      ].filter((group) => group.applications.length > 0);
    } else if (gb === 'mine') {
      groups = [
        {
          title: 'Your applications',
          applications: apps.filter((app) => app.submitterUserId === ownUserId),
        },
        {
          title: 'Other applications',
          applications: apps.filter((app) => app.submitterUserId !== ownUserId),
        },
      ];
    } else {
      groups = [{ title: null, applications: apps }];
    }
  }

  let searchQuery = '';

  $: populateGroups(applications, groupBy, searchQuery);
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
    {#each groups as group}
      <div class="table-wrapper">
        {#if group.title}<h5>{group.title}</h5>{/if}
        <div class="applications-table">
          {#each group.applications as application}
            <ApplicationLineItem
              {voteStep}
              {ballotStore}
              {reviewMode}
              {round}
              {application}
              bind:decision={decisions[application.id]}
            />
          {/each}
          {#if group.applications.length === 0}
            <div class="empty">Nothing to see here</div>
          {/if}
        </div>
      </div>
    {/each}
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

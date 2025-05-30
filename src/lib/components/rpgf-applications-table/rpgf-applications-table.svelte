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
  $: if (groupBy === 'state') {
    groups = [
      {
        title: 'Pending review',
        applications: applications.filter((app) => app.state === 'pending'),
      },
      { title: 'Approved', applications: applications.filter((app) => app.state === 'approved') },
      { title: 'Rejected', applications: applications.filter((app) => app.state === 'rejected') },
    ].filter((group) => group.applications.length > 0);
  } else if (groupBy === 'mine') {
    groups = [
      {
        title: 'Your applications',
        applications: applications.filter((app) => app.submitterUserId === ownUserId),
      },
      {
        title: 'Other applications',
        applications: applications.filter((app) => app.submitterUserId !== ownUserId),
      },
    ];
  } else {
    groups = [{ title: null, applications }];
  }
</script>

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

<style>
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

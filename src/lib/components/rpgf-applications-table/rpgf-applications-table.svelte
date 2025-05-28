<script lang="ts">
  import type { Application } from '$lib/utils/rpgf/schemas';
  import type { RpgfUserData } from '$lib/utils/rpgf/siwe';
  import ApplicationLineItem from './components/application-line-item.svelte';

  export let userData: RpgfUserData | null;
  export let userIsAdmin: boolean = false;
  export let applications: Application[];
  export let roundSlug: string;
  export let maxItems: number | undefined = undefined;
  export let seperateOwnApplications: boolean = true;

  $: ownUserId = userData?.userId;

  $: ownApplications = applications.filter((app) => app.submitterUserId === ownUserId);
  $: otherApplications = applications
    .filter((app) => app.submitterUserId !== ownUserId)
    .slice(0, maxItems);

  export let overflowing: boolean | undefined = undefined;
  $: overflowing = maxItems ? otherApplications.length > maxItems : false;
</script>

<div class="wrapper">
  {#if seperateOwnApplications && ownApplications.length > 0}
    <div class="table-wrapper">
      <h5>Your applications</h5>
      <div class="applications-table">
        {#each ownApplications as application}
          <ApplicationLineItem {roundSlug} {application} />
        {/each}
        {#if applications.length === 0}
          <div class="empty">Nothing to see here</div>
        {/if}
      </div>
    </div>
  {/if}

  <div class="table-wrapper">
    {#if seperateOwnApplications}<h5>{userIsAdmin ? 'All' : 'Approved'} applications</h5>{/if}
    <div class="applications-table">
      {#each otherApplications as application}
        <ApplicationLineItem {roundSlug} {application} />
      {/each}
      {#if otherApplications.length === 0}
        <div class="empty">Nothing to see here</div>
      {/if}
    </div>
  </div>
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

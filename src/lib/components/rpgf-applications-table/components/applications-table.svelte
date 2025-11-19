<script lang="ts">
  import type { ListingApplication } from '$lib/utils/rpgf/types/application';
  import type { Writable } from 'svelte/store';
  import ApplicationLineItem from './application-line-item.svelte';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  export let includesResults: boolean;
  export let applications: ListingApplication[];
  export let filteredApplications: ListingApplication[];
  export let ellipsis: boolean = false;
  export let signedIn: boolean;
  export let displayVisibilityNote = false;
  export let hideState = false;

  export let voteStep: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot>;
  export let reviewMode = false;
  export let round: Round;
  export let decisions: Record<string, 'approve' | 'reject' | null> = {};
</script>

<div class="wrapper">
  <div class="table-wrapper">
    {#if includesResults}
      <div class="applications-table-header">
        <h5>Project name</h5>
        <h5>Vote result</h5>
      </div>
    {/if}
    <div class="applications-table" class:empty={applications.length === 0}>
      {#each filteredApplications as application (application.id)}
        <ApplicationLineItem
          {ellipsis}
          {voteStep}
          {ballotStore}
          {reviewMode}
          {round}
          {application}
          {hideState}
          bind:decision={decisions[application.id]}
        />
      {/each}
      {#if applications.length === 0}
        <div class="empty">
          No applications matched your filters.{signedIn ? '' : ' You may have to sign in.'}
        </div>
      {/if}
    </div>
    {#if displayVisibilityNote}
      <AnnotationBox type="info">
        <span class="typo-text-small-bold">Don't see your application?</span>
        Only round admins can see applications before they've been approved. To check on the status of
        your own applications, ensure you're signed in with the wallet address you used to submit it.
      </AnnotationBox>
    {/if}
  </div>
</div>

<style>
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
    overflow: hidden;
  }

  .applications-table:not(.empty) {
    border: 1px solid var(--color-foreground-level-3);
  }

  .empty {
    padding: 0 1rem;
    text-align: center;
    color: var(--color-foreground-level-5);
  }
</style>

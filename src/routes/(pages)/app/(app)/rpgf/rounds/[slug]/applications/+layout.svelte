<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import RpgfVotingCard from '$lib/components/rpgf-voting-card/rpgf-voting-card.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
  import { submitApplicationReview } from '$lib/utils/rpgf/rpgf.js';
  import type { ApplicationReviewDto } from '$lib/utils/rpgf/schemas.js';

  export let data;

  $: decisionsStore = data.decisions;
  $: decisions = $decisionsStore;

  $: approveCount = decisions && Object.values(decisions).filter((v) => v === 'approve').length;
  $: rejectCount = decisions && Object.values(decisions).filter((v) => v === 'reject').length;
  $: hasDecisions = decisions && Object.values(decisions).filter((v) => v !== null).length > 0;

  async function handleSubmitReviewDecisions() {
    const mappedToDto: ApplicationReviewDto = mapFilterUndefined(
      Object.entries(decisions),
      ([applicationId, decision]) => {
        if (decision === null) return undefined; // Skip null decisions

        return {
          applicationId,
          decision,
        };
      },
    );

    await submitApplicationReview(undefined, data.wrappedRound.round.urlSlug, mappedToDto);

    await invalidateAll();
  }

  $: ballotStore = data.ballot;
</script>

<div class="applications-layout" class:two-column={data.reviewMode || data.voteMode}>
  <div class="sidebar">
    <div class="sidebar-inner">
      {#if data.reviewMode}
        <div class="review-card">
          <h5>Review applications</h5>
          <p class="typo-text-small">
            As an admin, you can review applications for this round. Feel free to dig into the
            details - we'll save your decisions as you go.
          </p>
          <Divider />
          <div class="decisions-count">
            <span class="typo-text-small">Approve</span>
            <span class="typo-text-small-bold">{approveCount}</span>
            <span class="typo-text-small">• Reject</span>
            <span class="typo-text-small-bold">{rejectCount}</span>
          </div>
          <Button
            disabled={!hasDecisions}
            variant="primary"
            on:click={() => doWithErrorModal(handleSubmitReviewDecisions)}>Submit</Button
          >
        </div>
      {/if}

      {#if data.voteMode}
        <RpgfVotingCard round={data.wrappedRound.round} ballot={$ballotStore} />
      {/if}
    </div>
  </div>

  <div class="page">
    <slot />
  </div>
</div>

<style>
  .applications-layout {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas: 'page';
    gap: 2rem;
  }

  .applications-layout.two-column {
    grid-template-columns: 1fr minmax(auto, 18rem);
    grid-template-areas: 'page sidebar';
  }

  .sidebar {
    grid-area: sidebar;
  }

  .sidebar-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 6.5rem;
  }

  .review-card {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    view-transition-name: rpgf-applications-review-card;
  }

  .page {
    grid-area: page;
  }
</style>

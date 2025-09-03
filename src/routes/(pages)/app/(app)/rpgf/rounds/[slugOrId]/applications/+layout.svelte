<script lang="ts">
  import { invalidateAll, replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import RpgfResultsCard from '$lib/components/rpgf-results-card/rpgf-results-card.svelte';
  import RpgfVotingCard from '$lib/components/rpgf-voting-card/rpgf-voting-card.svelte';
  import {
    clearDecisions,
    decisionsStore,
  } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
  import { submitApplicationReview } from '$lib/utils/rpgf/rpgf.js';
  import type { ApplicationReviewDto } from '$lib/utils/rpgf/schemas.js';

  export let data;

  $: approveCount = Object.values($decisionsStore).filter((v) => v === 'approve').length;
  $: rejectCount = Object.values($decisionsStore).filter((v) => v === 'reject').length;
  $: hasDecisions = approveCount + rejectCount > 0;

  async function handleSubmitReviewDecisions() {
    const mappedToDto: ApplicationReviewDto = mapFilterUndefined(
      Object.entries($decisionsStore),
      ([applicationId, decision]) => {
        if (decision === null) return undefined; // Skip null decisions

        return {
          applicationId,
          decision,
        };
      },
    );

    await submitApplicationReview(undefined, data.wrappedRound.round.urlSlug, mappedToDto);

    clearDecisions();

    await invalidateAll();
  }

  $: ballotStore = data.ballot;

  // remove #content-anchor from the URL if it exists
  $: if ($page.url.hash === '#content-anchor') {
    replaceState($page.url.pathname + $page.url.search, $page.state);
  }
</script>

<div
  class="applications-layout"
  class:two-column={data.reviewMode || data.voteMode || data.resultsMode}
>
  <div class="sidebar">
    <div class="sidebar-inner">
      {#if data.reviewMode}
        <div class="sidebar-card">
          <h5>Review applications</h5>
          <p class="typo-text-small">
            As an admin, you can review applications for this round. Mark applications as approved
            or rejected within the table and submit your decisions in bulk when you're done.
          </p>

          <AnnotationBox>
            Decisions are final and can no longer be changed once submitted.
          </AnnotationBox>

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
            on:click={() =>
              doWithConfirmationModal(
                "Are you sure you want to submit these decisions? You can't undo them later.",
                async () => await doWithErrorModal(handleSubmitReviewDecisions),
              )}>Submit</Button
          >
        </div>
      {/if}

      {#if data.voteMode}
        <RpgfVotingCard
          previouslyCastBallot={Boolean(data.existingBallot)}
          round={data.wrappedRound.round}
          ballot={ballotStore}
        />
      {/if}

      {#if data.resultsMode}
        <div class="sidebar-card">
          <RpgfResultsCard
            resultsCalculated={data.wrappedRound.round.resultsCalculated}
            resultsPublished={data.wrappedRound.round.resultsPublished}
            roundSlug={data.wrappedRound.round.urlSlug}
            roundName={data.wrappedRound.round.name}
          />
        </div>
      {/if}
    </div>
  </div>

  <div class="page">
    <div
      id="content-anchor"
      style:visibility="hidden"
      style:position="absolute"
      style:top="-84px"
    />
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

  .applications-layout:not(.two-column) .sidebar {
    display: none;
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

  .sidebar-card {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    view-transition-name: rpgf-applications-sidebar-card;
    view-transition-class: element-handover;
  }

  .page {
    position: relative;
    grid-area: page;
    max-width: calc(100vw - 2rem);
  }

  @media (max-width: 1251px) {
    .applications-layout.two-column {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas: 'sidebar' 'page';
    }
  }
</style>

<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import RpgfResultsCard from '$lib/components/rpgf-results-card/rpgf-results-card.svelte';
  import RpgfVotingCard from '$lib/components/rpgf-voting-card/rpgf-voting-card.svelte';
  import { forceCollapsed } from '$lib/components/sidenav/sidenav-store.js';
  import {
    clearDecisions,
    decisionsStore,
  } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
  import { submitApplicationReview } from '$lib/utils/rpgf/rpgf.js';
  import type { ApplicationReviewDto } from '$lib/utils/rpgf/types/application.js';
  import type { InProgressBallot, WrappedBallot } from '$lib/utils/rpgf/types/ballot';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { onMount, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import {
    ballotValidationContextKey,
    type BallotValidationErrorsStore,
  } from '$lib/utils/rpgf/ballot-validation-context';

  interface Props {
    round: Round;
    ballot: Writable<InProgressBallot> & {
      clear: () => void;
    };
    voteMode: boolean;
    reviewMode: boolean;
    resultsMode: boolean;
    existingBallot: WrappedBallot | null;
    pageIsEmpty?: boolean;
    hideAppsPane?: boolean;
    apps?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    round,
    ballot,
    voteMode,
    reviewMode,
    resultsMode,
    existingBallot,
    pageIsEmpty = false,
    hideAppsPane = false,
    apps,
    children,
  }: Props = $props();

  const ballotValidationErrors: BallotValidationErrorsStore = writable(new Set());
  setContext(ballotValidationContextKey, ballotValidationErrors);

  onMount(() => {
    forceCollapsed.set(true);

    return () => {
      forceCollapsed.set(false);
    };
  });

  let approveCount = $derived(Object.values($decisionsStore).filter((v) => v === 'approve').length);
  let rejectCount = $derived(Object.values($decisionsStore).filter((v) => v === 'reject').length);
  let hasDecisions = $derived(approveCount + rejectCount > 0);

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

    await submitApplicationReview(undefined, round.id, mappedToDto);

    clearDecisions();

    await invalidate('rpgf:round');
    await invalidate('rpgf:round:applications');
  }

  let ballotStore = $derived(ballot);
</script>

<div
  class="applications-layout"
  class:page-is-empty={pageIsEmpty}
  class:apps-pane-hidden={hideAppsPane}
  class:three-column={reviewMode || voteMode || resultsMode}
>
  {#if reviewMode || voteMode || resultsMode}
    <div class="sidebar">
      <div class="sidebar-inner">
        {#if reviewMode}
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
              onclick={() =>
                doWithConfirmationModal(
                  "Are you sure you want to submit these decisions? You can't undo them later.",
                  async () => await doWithErrorModal(handleSubmitReviewDecisions),
                )}>Submit</Button
            >
          </div>
        {/if}

        {#if voteMode}
          <RpgfVotingCard
            previouslyCastBallot={existingBallot}
            {round}
            ballot={ballotStore}
            {ballotValidationErrors}
          />
        {/if}

        {#if resultsMode}
          <div class="sidebar-card">
            <RpgfResultsCard {round} />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if apps}
    <div class="apps">
      <div class="apps-inner">
        {@render apps?.()}
      </div>
    </div>
  {/if}

  <div class="page">
    <div style:visibility="hidden" style:position="absolute" style:top="-84px"></div>
    {@render children?.()}
  </div>
</div>

<style>
  .applications-layout {
    display: grid;
    grid-template-columns: minmax(24rem, 1fr) 2fr;
    grid-template-areas: 'apps page';
    gap: 2rem;
  }

  .applications-layout.apps-pane-hidden {
    grid-template-columns: 1fr;
    grid-template-areas: 'page';
  }

  .applications-layout.three-column.apps-pane-hidden {
    grid-template-columns: 1fr minmax(auto, 18rem);
    grid-template-areas: 'page sidebar';
  }

  .apps {
    grid-area: apps;
    min-width: 0;
    view-transition-name: rpgf-applications-apps-card;
    view-transition-class: element-handover;
  }

  .apps-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: calc(100vh - 7rem);
    position: sticky;
    top: 6rem;
    border: 1px solid var(--color-foreground-level-3);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
  }

  .applications-layout.three-column {
    grid-template-columns: minmax(24rem, 1fr) 2fr minmax(auto, 18rem);
    grid-template-areas: 'apps page sidebar';
  }

  .applications-layout:not(.three-column) .sidebar {
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
    top: 6rem;
    view-transition-name: rpgf-applications-sidebar;
    view-transition-class: element-handover;
  }

  .sidebar-card {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  .page {
    position: relative;
    grid-area: page;
    max-width: calc(100vw - 2rem);
    min-width: 0;
  }

  @media (max-width: 1400px) {
    .applications-layout.three-column,
    .applications-layout.three-column.apps-pane-hidden {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas: 'sidebar' 'page';
    }

    .applications-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas: 'page';
    }

    .apps-inner {
      width: 100%;
      height: auto;
      padding: 0;
      border: none;
    }

    .applications-layout:not(.page-is-empty) .apps {
      display: none;
    }

    .page-is-empty .page {
      display: none;
    }

    .page-is-empty .apps {
      grid-area: page;
    }
  }
</style>

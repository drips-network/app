<script lang="ts">
  import { browser } from '$app/environment';
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import RpgfResultsCard from '$lib/components/rpgf-results-card/rpgf-results-card.svelte';
  import RpgfVotingCard from '$lib/components/rpgf-voting-card/rpgf-voting-card.svelte';
  import { forceCollapsed } from '$lib/components/sidenav/sidenav-store.js';
  import storedWritable from '@efstajas/svelte-stored-writable';
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
  import unreachable from '$lib/utils/unreachable.js';
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import z from 'zod';

  export let round: Round;
  export let ballot: Writable<InProgressBallot> & {
    clear: () => void;
  };
  export let voteMode: boolean;
  export let reviewMode: boolean;
  export let resultsMode: boolean;
  export let existingBallot: WrappedBallot | null;
  export let pageIsEmpty = false;
  export let hideAppsPane = false;

  const appsPaneWidthStore = storedWritable<number | null>(
    'rpgf-applications-pane-width',
    z.number().int().min(0).nullable(),
    null,
    !browser,
  );

  const persistAppsPaneWidth = (width: number | null) => {
    if (get(appsPaneWidthStore) !== width) {
      appsPaneWidthStore.set(width);
    }
  };

  onMount(() => {
    forceCollapsed.set(true);

    hasMounted = true;

    let mediaQuery: MediaQueryList | undefined;
    let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined;

    const updateForViewport = (matches: boolean) => {
      isDesktop = !matches;

      if (!isDesktop) {
        appsColumnWidth = undefined;
        resizeContext = null;
        isResizing = false;
      }

      updateAccessibleBounds();
      updateCurrentAppsWidth();
    };

    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(max-width: 1400px)');
      updateForViewport(mediaQuery.matches);

      mediaQueryListener = (event: MediaQueryListEvent) => updateForViewport(event.matches);
      mediaQuery.addEventListener('change', mediaQueryListener);

      window.addEventListener('resize', handleWindowResize);

      tick().then(() => {
        updateAccessibleBounds();
        updateCurrentAppsWidth();
      });
    }

    return () => {
      forceCollapsed.set(false);

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleWindowResize);
      }

      if (mediaQuery && mediaQueryListener) {
        mediaQuery.removeEventListener('change', mediaQueryListener);
      }
    };
  });

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

    await submitApplicationReview(undefined, round.id, mappedToDto);

    clearDecisions();

    await invalidate('rpgf:round');
    await invalidate('rpgf:round:applications');
  }

  $: ballotStore = ballot;

  const MIN_APPS_WIDTH_REM = 18;
  const MIN_PAGE_WIDTH_REM = 32;
  const KEYBOARD_STEP_REM = 1;

  let containerEl: HTMLDivElement;
  let appsEl: HTMLDivElement | null = null;
  let pageEl: HTMLDivElement | null = null;
  let sidebarEl: HTMLDivElement | null = null;

  let appsColumnWidth: string | undefined;
  let isResizing = false;
  let isDesktop = true;
  let hasMounted = false;
  let accessibleMin: number | undefined;
  let accessibleMax: number | undefined;
  let accessibleNow: number | undefined;
  let appsColumnWidthValue: string | undefined;

  type ResizeBounds = {
    min: number;
    max: number;
    gap: number;
    containerLeft: number;
  };

  type ResizeContext = ResizeBounds & {
    pointerId: number;
  };

  let resizeContext: ResizeContext | null = null;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const getRemSize = () => {
    if (typeof window === 'undefined') return 16;
    const rootStyles = getComputedStyle(document.documentElement);
    return parseFloat(rootStyles.fontSize) || 16;
  };

  const computeResizeBounds = (): ResizeBounds | null => {
    if (!containerEl || !isDesktop || hideAppsPane || !appsEl) return null;

    const containerRect = containerEl.getBoundingClientRect();
    const styles = getComputedStyle(containerEl);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const rem = getRemSize();
    const minAppsWidth = MIN_APPS_WIDTH_REM * rem;
    const minPageWidth = MIN_PAGE_WIDTH_REM * rem;
    const sidebarWidth = sidebarEl ? sidebarEl.getBoundingClientRect().width : 0;
    const maxAppsWidthCandidate = containerRect.width - gap - minPageWidth - sidebarWidth;
    const maxAppsWidth = Math.max(minAppsWidth, maxAppsWidthCandidate);

    return {
      min: minAppsWidth,
      max: maxAppsWidth,
      gap,
      containerLeft: containerRect.left,
    };
  };

  const updateAccessibleBounds = () => {
    if (!showResizer) {
      accessibleMin = undefined;
      accessibleMax = undefined;
      return null;
    }

    const bounds = computeResizeBounds();

    if (!bounds) {
      accessibleMin = undefined;
      accessibleMax = undefined;
      return null;
    }

    accessibleMin = Math.round(bounds.min);
    accessibleMax = Math.round(bounds.max);

    return bounds;
  };

  const updateCurrentAppsWidth = () => {
    if (!appsEl || !showResizer) {
      accessibleNow = undefined;
      return;
    }

    const width = Math.round(appsEl.getBoundingClientRect().width);
    accessibleNow = width;
  };

  const applyAppsWidth = (width: number) => {
    const bounds = updateAccessibleBounds();

    if (bounds) {
      const clampedWidth = clamp(width, bounds.min, bounds.max);
      const roundedWidth = Math.round(clampedWidth);
      appsColumnWidth = `${roundedWidth}px`;
      accessibleNow = roundedWidth;
      return roundedWidth;
    }

    return null;
  };

  const startResize = (event: PointerEvent) => {
    if (!showResizer || (event.pointerType === 'mouse' && event.button !== 0)) return;

    const bounds = updateAccessibleBounds();

    if (!bounds || !appsEl) return;

    resizeContext = {
      ...bounds,
      pointerId: event.pointerId,
    };

    accessibleNow = Math.round(appsEl.getBoundingClientRect().width);
    isResizing = true;

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);

    event.preventDefault();
  };

  const handleResizeMove = (event: PointerEvent) => {
    if (!isResizing || !resizeContext) return;

    const proposedWidth = event.clientX - resizeContext.containerLeft - resizeContext.gap / 2;
    applyAppsWidth(proposedWidth);
  };

  const stopResize = (event: PointerEvent) => {
    if (!isResizing || !resizeContext) return;

    const target = event.currentTarget as HTMLElement;

    try {
      target.releasePointerCapture(resizeContext.pointerId);
    } catch {
      // Ignore release errors when pointer capture is not active.
    }

    isResizing = false;
    resizeContext = null;

    updateAccessibleBounds();
    updateCurrentAppsWidth();

    if (typeof accessibleNow === 'number') {
      const appliedWidth = Math.round(accessibleNow);
      persistAppsPaneWidth(appliedWidth);
    }
  };

  const handleKeyResize = (event: KeyboardEvent) => {
    if (!showResizer) return;

    const bounds = updateAccessibleBounds();

    if (!bounds || !appsEl) return;

    const rem = getRemSize();
    const step = KEYBOARD_STEP_REM * rem;

    let currentWidth = appsColumnWidth
      ? parseFloat(appsColumnWidth)
      : appsEl.getBoundingClientRect().width;

    if (!Number.isFinite(currentWidth)) {
      currentWidth = appsEl.getBoundingClientRect().width;
    }

    let handled = true;

    switch (event.key) {
      case 'ArrowLeft':
        currentWidth -= step;
        break;
      case 'ArrowRight':
        currentWidth += step;
        break;
      case 'Home':
        currentWidth = bounds.min;
        break;
      case 'End':
        currentWidth = bounds.max;
        break;
      default:
        handled = false;
    }

    if (!handled) return;

    event.preventDefault();

    const clampedWidth = clamp(currentWidth, bounds.min, bounds.max);
    const appliedWidth = applyAppsWidth(clampedWidth);

    if (appliedWidth !== null) {
      persistAppsPaneWidth(appliedWidth);
    }
  };

  const resetAppsWidth = async () => {
    if (!showResizer) return;

    persistAppsPaneWidth(null);
    appsColumnWidth = undefined;
    accessibleNow = undefined;
    await tick();
    updateAccessibleBounds();
    updateCurrentAppsWidth();
  };

  const handleWindowResize = () => {
    if (!showResizer) return;

    const bounds = updateAccessibleBounds();

    if (!bounds) return;

    if (!appsColumnWidth) {
      updateCurrentAppsWidth();
      return;
    }

    const currentWidth = parseFloat(appsColumnWidth);

    if (!Number.isFinite(currentWidth)) {
      updateCurrentAppsWidth();
      return;
    }

    const clampedWidth = clamp(currentWidth, bounds.min, bounds.max);
    const appliedWidth = applyAppsWidth(clampedWidth);

    if (appliedWidth !== null) {
      persistAppsPaneWidth(appliedWidth);
    } else {
      updateCurrentAppsWidth();
    }
  };

  let showResizer = false;

  $: showResizer = isDesktop && !hideAppsPane && !!$$slots.apps;

  $: appsColumnWidthValue = showResizer ? appsColumnWidth : undefined;

  $: if ((hideAppsPane || !$$slots.apps) && appsColumnWidth) {
    appsColumnWidth = undefined;
    resizeContext = null;
  }

  const syncAppsPaneWidth = (persistedWidth: number | null) => {
    if (!showResizer) {
      updateAccessibleBounds();
      return;
    }

    if (persistedWidth !== null) {
      const appliedWidth = applyAppsWidth(persistedWidth);

      if (appliedWidth !== null && appliedWidth !== persistedWidth) {
        persistAppsPaneWidth(appliedWidth);
      }
    } else {
      updateAccessibleBounds();
      updateCurrentAppsWidth();
    }
  };

  $: if (showResizer && hasMounted) {
    const persistedWidth = $appsPaneWidthStore;

    tick().then(() => {
      syncAppsPaneWidth(persistedWidth);
    });
  }
</script>

<div
  class="applications-layout"
  bind:this={containerEl}
  style:--apps-column-width={appsColumnWidthValue}
  class:page-is-empty={pageIsEmpty}
  class:apps-pane-hidden={hideAppsPane}
  class:three-column={reviewMode || voteMode || resultsMode}
>
  {#if reviewMode || voteMode || resultsMode}
    <div class="sidebar" bind:this={sidebarEl}>
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
              on:click={() =>
                doWithConfirmationModal(
                  "Are you sure you want to submit these decisions? You can't undo them later.",
                  async () => await doWithErrorModal(handleSubmitReviewDecisions),
                )}>Submit</Button
            >
          </div>
        {/if}

        {#if voteMode}
          <RpgfVotingCard previouslyCastBallot={existingBallot} {round} ballot={ballotStore} />
        {/if}

        {#if resultsMode}
          <div class="sidebar-card">
            <RpgfResultsCard
              resultsCalculated={round.resultsCalculated}
              resultsPublished={round.resultsPublished}
              roundId={round.id}
              roundName={round.name ?? unreachable()}
            />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if $$slots.apps}
    <div class="apps" bind:this={appsEl}>
      <div class="apps-sticky">
        <div class="apps-inner-wrapper">
          <div class="apps-inner">
            <slot name="apps" />
          </div>

          {#if showResizer}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-no-noninteractive-tabindex -->
            <div
              class="apps-resizer"
              class:is-dragging={isResizing}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize applications pane"
              aria-valuemin={accessibleMin}
              aria-valuemax={accessibleMax}
              aria-valuenow={accessibleNow}
              tabindex="0"
              on:pointerdown={startResize}
              on:pointermove={handleResizeMove}
              on:pointerup={stopResize}
              on:pointercancel={stopResize}
              on:keydown={handleKeyResize}
              on:dblclick={resetAppsWidth}
            />
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <div class="page" bind:this={pageEl}>
    <div style:visibility="hidden" style:position="absolute" style:top="-84px" />
    <slot />
  </div>
</div>

<style>
  .applications-layout {
    display: grid;
    grid-template-columns: var(--apps-column-width, minmax(24rem, 1fr)) 2fr;
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
  }

  .apps-sticky {
    position: sticky;
    top: 6rem;
    height: calc(100vh - 7rem);
    width: 100%;
  }

  .apps-inner-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .apps-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    border: 1px solid var(--color-foreground-level-3);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    view-transition-name: rpgf-applications-apps-card;
    view-transition-class: element-handover;
    overflow: auto;
  }

  .applications-layout.three-column {
    grid-template-columns: var(--apps-column-width, minmax(24rem, 1fr)) 2fr minmax(auto, 18rem);
    grid-template-areas: 'apps page sidebar';
  }

  .apps-resizer {
    position: absolute;
    top: 0;
    right: -1rem;
    width: 2rem;
    height: 100%;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    border: none;
    background: transparent;
    outline: none;
    view-transition-name: rpgf-applications-resizer;
  }

  .apps-resizer::before {
    content: '';
    display: block;
    width: 0.25rem;
    height: 40%;
    border-radius: 9999px;
    background: var(--color-foreground-level-3);
    transition:
      background 0.2s ease,
      height 0.2s ease;
  }

  .apps-resizer:hover::before,
  .apps-resizer:focus-visible::before,
  .apps-resizer.is-dragging::before {
    background: var(--color-primary);
    height: 42%;
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
    min-width: 0;
  }

  @media (max-width: 1400px) {
    .applications-layout.three-column {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas: 'sidebar' 'page';
    }

    .applications-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas: 'page';
    }

    .apps-sticky {
      position: static;
      height: auto;
    }

    .apps-inner-wrapper {
      height: auto;
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

    .apps-resizer {
      display: none;
    }
  }
</style>

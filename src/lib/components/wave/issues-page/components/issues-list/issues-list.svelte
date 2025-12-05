<script lang="ts">
  import type { getIssues } from '$lib/utils/wave/issues';
  import VirtualList from 'svelte-tiny-virtual-list';
  import IssuesListItem from './components/issues-list-item.svelte';
  import { determineIssuesListItemHeight } from './components/determine-issues-list-item-height';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import { SvelteSet } from 'svelte/reactivity';
  import type { WaveDto } from '$lib/utils/wave/types/wave';
  import { onMount } from 'svelte';
  import {
    registerIssueUpdateListener,
    unregisterIssueUpdateListener,
  } from '../../issue-update-coordinator';

  let {
    issuesWithPagination,
    getMoreIssues,
    waves,
    multiselectMode = false,
    pathPrefix,
    showNewApplicationsBadge = false,
    onselectchange,
    ownUserId,
  }: {
    issuesWithPagination: Awaited<ReturnType<typeof getIssues>>;
    getMoreIssues: (
      pagination: Pagination,
    ) => Promise<Awaited<ReturnType<typeof getIssues>> | null>;
    /** For building hrefs for issues links, e.g. '/wave/maintainers/issues' */
    pathPrefix: string;
    /** For displaying wave data in list items */
    waves: WaveDto[];
    multiselectMode?: boolean;
    /** If true, issues with applications but no applicants receive a badge */
    showNewApplicationsBadge?: boolean;
    onselectchange?: (selectedIssues: IssueDetailsDto[]) => void;
    ownUserId: string | null;
  } = $props();

  let issues = $state(issuesWithPagination.data);
  let currentPagination = $state(issuesWithPagination.pagination);

  let heightObserverEl = $state<HTMLDivElement>();
  let heightObserverHeight = $state<number>(0);

  function measureHeight(node: HTMLElement) {
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        heightObserverHeight = entry.contentRect.height;
      }
    });

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  let itemHeights = $derived(
    issues.map((issue) =>
      determineIssuesListItemHeight(issue, showNewApplicationsBadge, ownUserId),
    ),
  );
  let totalItemHeight = $derived(itemHeights.reduce((acc, height) => acc + height, 0));

  let infiniteLoadingTriggerEl = $state<HTMLDivElement>();
  let loadingMore = $state<boolean>(false);

  $effect(() => {
    if (!infiniteLoadingTriggerEl) return;

    const parent = infiniteLoadingTriggerEl.parentElement;

    const observer = new IntersectionObserver(
      (entries) => {
        if (loadingMore) return;

        for (let entry of entries) {
          if (entry.isIntersecting) {
            if (currentPagination.hasNextPage === false) return;
            loadingMore = true;
            getMoreIssues(currentPagination).then((res) => {
              if (!res) {
                loadingMore = false;
                return;
              }

              const { data, pagination } = res;

              currentPagination = pagination;

              // filter against duplicates in case of unstable pagination
              issues = [
                ...issues,
                ...data.filter((newIssue) => !issues.find((issue) => issue.id === newIssue.id)),
              ];

              loadingMore = false;
            });
          }
        }
      },
      {
        root: parent,
        rootMargin: '0px',
        threshold: 0,
      },
    );

    observer.observe(infiniteLoadingTriggerEl);

    return () => {
      observer?.disconnect();
    };
  });

  let shiftKeyHeld = $state<boolean>(false);
  let lastClickedIndex = $state<number | null>(null);
  let selectedIndices = new SvelteSet<number>();

  function handleItemSelect(index: number, selected: boolean) {
    if (selected) {
      selectedIndices.add(index);
    } else {
      selectedIndices.delete(index);
    }

    if (shiftKeyHeld && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);

      for (let i = start; i <= end; i++) {
        if (selected) {
          const issueStatus = issues[i].state;
          if (issueStatus !== 'open') continue;

          selectedIndices.add(i);
        } else {
          selectedIndices.delete(i);
        }
      }
    }

    lastClickedIndex = index;
  }

  $effect(() => {
    if (onselectchange) {
      const selectedIssues = Array.from(selectedIndices).map((index) => issues[index]);
      onselectchange(selectedIssues);
    }
  });

  export function clearSelection() {
    selectedIndices = new SvelteSet();
  }

  function getWaveById(waveId: string | null): WaveDto | null {
    if (!waveId) return null;

    return waves.find((wave) => wave.id === waveId) || null;
  }

  let virtualListInstance: VirtualList;

  /** Surgically update an issue. Awkward but necessary considering the endless scrolling */
  function patchIssues(updatedIssues: IssueDetailsDto[]) {
    let lowestUpdatedIndex = 0;

    for (const updatedIssue of updatedIssues) {
      const index = issues.findIndex((issue) => issue.id === updatedIssue.id);

      if (index === -1) continue;

      issues[index] = updatedIssue;

      if (index < lowestUpdatedIndex) {
        lowestUpdatedIndex = index;
      }
    }

    virtualListInstance?.recomputeSizes(lowestUpdatedIndex);
  }

  onMount(() => {
    const issueUpdatedListener = (updatedIssues: IssueDetailsDto[]) => {
      patchIssues(updatedIssues);
    };

    registerIssueUpdateListener(issueUpdatedListener);

    return () => {
      unregisterIssueUpdateListener(issueUpdatedListener);
    };
  });
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === 'Shift') {
      shiftKeyHeld = true;
    }
  }}
  on:keyup={(e) => {
    if (e.key === 'Shift') {
      shiftKeyHeld = false;
    }
  }}
/>

<div class="wrapper">
  <div class="height-observer" bind:this={heightObserverEl} use:measureHeight></div>
  <VirtualList
    bind:this={virtualListInstance}
    height={heightObserverHeight}
    itemCount={issues.length}
    itemSize={itemHeights}
    getKey={(index) => issues[index].id}
    estimatedItemSize={totalItemHeight}
  >
    {#snippet item({ style, index })}
      {@const issue = issues[index]}
      <div {style}>
        <IssuesListItem
          {ownUserId}
          {issue}
          {showNewApplicationsBadge}
          selectable={multiselectMode}
          selected={selectedIndices.has(index)}
          onselect={(selected) => handleItemSelect(index, selected)}
          partOfWave={getWaveById(issue.waveId)}
          {pathPrefix}
        />
      </div>
    {/snippet}

    {#snippet footer()}
      <div class="infinite-loading-trigger" bind:this={infiniteLoadingTriggerEl}></div>

      {#if loadingMore}
        <div class="spinner">
          <Spinner />
        </div>
      {/if}
    {/snippet}
  </VirtualList>
</div>

<style>
  .wrapper {
    height: 100%;
    flex: 1;
    position: relative;
    user-select: none;
  }

  .height-observer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    pointer-events: none;
    opacity: 0;
  }

  .infinite-loading-trigger {
    width: 100%;
    height: 1px;
  }

  .spinner {
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

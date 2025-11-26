<script lang="ts">
  import type { getIssues } from '$lib/utils/wave/issues';
  import VirtualList from 'svelte-tiny-virtual-list';
  import IssuesListItem from './components/issues-list-item.svelte';
  import { determineIssuesListItemHeight } from './components/determine-issues-list-item-height';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import Spinner from '$lib/components/spinner/spinner.svelte';

  let {
    issuesWithPagination,
    getMoreIssues,
  }: {
    issuesWithPagination: Awaited<ReturnType<typeof getIssues>>;
    getMoreIssues: (
      pagination: Pagination,
    ) => Promise<Awaited<ReturnType<typeof getIssues>> | null>;
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

  let itemHeights = $derived(issues.map((issue) => determineIssuesListItemHeight(issue)));
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
              issues = [...issues, ...data];

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
</script>

<div class="wrapper">
  <div class="height-observer" bind:this={heightObserverEl} use:measureHeight></div>
  <VirtualList
    height={heightObserverHeight}
    itemCount={issues.length}
    itemSize={itemHeights}
    getKey={(index) => issues[index].id}
    estimatedItemSize={totalItemHeight}
  >
    {#snippet item({ style, index })}
      {@const issue = issues[index]}
      <div {style}>
        <IssuesListItem {issue} />
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

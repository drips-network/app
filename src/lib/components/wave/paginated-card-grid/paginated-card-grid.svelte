<script lang="ts" generics="T">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import type { PaginatedResponse, Pagination } from '$lib/utils/wave/types/pagination';
  import { onMount, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    initialData: PaginatedResponse<T>;
    fetchMore: (page: number) => Promise<PaginatedResponse<T>>;
    card: Snippet<[item: T]>;
    key: (item: T) => string | number;
    items: T[];
    pagination: Pagination;
  }

  let {
    initialData,
    fetchMore,
    card,
    key,
    items = $bindable(initialData.data),
    pagination = $bindable(initialData.pagination),
  }: Props = $props();

  let isLoadingMore = $state(false);
  let fetchTriggerElem = $state<HTMLDivElement>();

  // Reset items/pagination when initialData changes
  $effect(() => {
    items = initialData.data;
    pagination = initialData.pagination;
  });

  function isTriggerInViewport(elem: HTMLDivElement) {
    const rect = elem.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  async function loadMore() {
    if (isLoadingMore || !pagination.hasNextPage) return;

    isLoadingMore = true;

    try {
      const nextPage = pagination.page + 1;
      const result = await fetchMore(nextPage);

      items = [...items, ...result.data];
      pagination = result.pagination;

      // Retrigger if still in viewport
      if (fetchTriggerElem && isTriggerInViewport(fetchTriggerElem) && pagination.hasNextPage) {
        setTimeout(() => {
          loadMore();
        }, 200);
      }
    } finally {
      isLoadingMore = false;
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );

    if (fetchTriggerElem) {
      observer.observe(fetchTriggerElem);
    }

    return () => {
      if (fetchTriggerElem) {
        observer.unobserve(fetchTriggerElem);
      }
    };
  });
</script>

<div class="card-grid">
  {#each items as item (key(item))}
    <div in:fade={{ duration: 200 }}>
      {@render card(item)}
    </div>
  {/each}
</div>
<div bind:this={fetchTriggerElem} class="fetch-trigger">
  {#if pagination.hasNextPage}
    <Spinner />
  {/if}
</div>

<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
  }

  .fetch-trigger {
    display: flex;
    height: 2rem;
    justify-content: center;
  }
</style>

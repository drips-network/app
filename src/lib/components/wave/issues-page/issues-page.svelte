<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Filter from '$lib/components/icons/Filter.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import SortMostToLeast from '$lib/components/icons/SortMostToLeast.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import IssuesList from '$lib/components/wave/issues-page/components/issues-list/issues-list.svelte';
  import type { ComponentProps, Snippet } from 'svelte';
  import { getIssues } from '$lib/utils/wave/issues';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import FilterConfig from './components/filter-config/filter-config.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';

  let {
    issues,
    children,
    onapplyfilters,
    appliedFilters,
    breadcrumbs,
  }: {
    issues: Awaited<ReturnType<typeof getIssues>>;
    children: Snippet;
    appliedFilters: IssueFilters;
    onapplyfilters?: (filters: IssueFilters) => void | Promise<void>;
    breadcrumbs: ComponentProps<typeof Breadcrumbs>['crumbs'];
  } = $props();

  async function getMoreIssues(pagination: Pagination, filters: IssueFilters) {
    const nextPage = pagination.page + 1;

    if (!nextPage) return null;

    return await getIssues(undefined, { page: nextPage, limit: pagination.limit }, filters);
  }

  let filtersOpen = $state<boolean>(false);

  let filterConfigInstance: FilterConfig;

  function handleFilterClick() {
    filtersOpen = !filtersOpen;

    if (!filtersOpen) {
      filterConfigInstance?.reset();
    }
  }

  let applyingFilters = $state<boolean>(false);

  async function handleApplyFilters(filters: IssueFilters) {
    applyingFilters = true;
    filtersOpen = false;

    // this should cause the `issues` prop to update
    await onapplyfilters?.(filters);

    applyingFilters = false;
  }
</script>

<div class="wrapper">
  <div class="issues">
    <div class="breadcrumbs-wrapper">
      <Breadcrumbs crumbs={breadcrumbs} />
    </div>

    <div class="issue-list-configuration">
      <Button icon={MagnifyingGlass}>Search</Button>

      <div>
        <Button icon={Filter} onclick={handleFilterClick} highlit={filtersOpen}>Filter</Button>
        <Button icon={SortMostToLeast}>Sort</Button>
      </div>
    </div>

    <TransitionedHeight collapsed={!filtersOpen}>
      <div class="filter-config">
        <Card>
          <FilterConfig
            bind:this={filterConfigInstance}
            {appliedFilters}
            onapply={handleApplyFilters}
          />
        </Card>
      </div>
    </TransitionedHeight>

    <Card style="padding: 0;" disabled={filtersOpen}>
      {#if applyingFilters}
        <div class="spinner">
          <Spinner />
        </div>
      {:else}
        <IssuesList
          issuesWithPagination={issues}
          getMoreIssues={(currentPagination) => getMoreIssues(currentPagination, appliedFilters)}
        />
      {/if}
    </Card>
  </div>

  <div class="content" style:padding-top="3.5rem">
    {@render children()}
  </div>
</div>

<style>
  .breadcrumbs-wrapper {
    margin-bottom: 1rem;
  }

  .wrapper {
    flex: 1;
    display: grid;
    flex-direction: column;
    grid-template-columns: 24rem 1fr;
    grid-template-rows: 1fr;
    gap: 1rem;
  }

  .issues {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 6rem);
    position: sticky;
    top: 5rem;
    view-transition-name: issues-list;
  }

  .issue-list-configuration {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .content {
    position: relative;
  }

  .filter-config {
    padding-bottom: 1rem;
  }

  .spinner {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
</style>

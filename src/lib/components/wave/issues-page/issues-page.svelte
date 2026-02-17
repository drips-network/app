<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Filter from '$lib/components/icons/Filter.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import SortMostToLeast from '$lib/components/icons/SortMostToLeast.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import IssuesList from '$lib/components/wave/issues-page/components/issues-list/issues-list.svelte';
  import { onMount, tick, type ComponentProps, type Snippet } from 'svelte';
  import { getIssues } from '$lib/utils/wave/issues';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import FilterConfig from './components/filter-config/filter-config.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import {
    type IssueDetailsDto,
    type IssueFilters,
    type IssueSortByOption,
  } from '$lib/utils/wave/types/issue';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import { fade } from 'svelte/transition';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import addIssuesToWaveFlow from '$lib/flows/wave/add-issues-to-wave-program/add-issues-to-wave-program-flow';
  import type {
    WaveProgramDto,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import {
    registerIssueUpdateListener,
    unregisterIssueUpdateListener,
  } from './issue-update-coordinator';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import SortByConfig from './components/sort-by-config/sort-by-config.svelte';
  import { page } from '$app/state';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  let {
    issues,
    children,
    appliedFilters,
    defaultFilters,
    appliedSort,
    breadcrumbs,
    allowAddToWaveProgram = false,
    waveProgramRepos: ownWaveProgramRepos = [],
    pathPrefix,
    showNewApplicationsBadge = false,
    wavePrograms,
    viewKey,
    ownUserId,
    noOfPreappliedFilters,
    filtersMode,
    availableSortByOptions,
    isViewingIssue,
    headMetaTitle,
    currentWaveProgram,
    emptyStateAnnotation,
  }: {
    issues: Awaited<ReturnType<typeof getIssues>>;
    children: Snippet;
    appliedFilters: IssueFilters;
    defaultFilters: IssueFilters;
    appliedSort: IssueSortByOption;
    breadcrumbs: ComponentProps<typeof Breadcrumbs>['crumbs'];
    allowAddToWaveProgram?: boolean;

    pathPrefix: string;

    /** User's own wave repos for determining what Waves, if any, issues may be added to */
    waveProgramRepos?: WaveProgramRepoWithDetailsDto[];

    /** For displaying wave program data in list items */
    wavePrograms: WaveProgramDto[];

    /** Unique name for the route the view is on to enable coherent view transitions */
    viewKey: string;

    showNewApplicationsBadge?: boolean;
    ownUserId: string | null;

    /** Some views have implicit initial filters applied - pass their count so that the
     * amount of user-configurable filters is accurate
     */
    noOfPreappliedFilters: number;

    /** Determines the set of filters shown */
    filtersMode: 'maintainer' | 'contributor' | 'wave';

    availableSortByOptions: IssueSortByOption[];
    isViewingIssue: boolean;

    headMetaTitle: string;

    /** If in wave mode, the current wave program for filters */
    currentWaveProgram?: Pick<WaveProgramDto, 'id' | 'slug'>;

    /** Annotation to show when there are no issues */
    emptyStateAnnotation?: string;
  } = $props();

  async function getMoreIssues(
    pagination: Pagination,
    filters: IssueFilters,
    sort: IssueSortByOption,
  ) {
    const nextPage = pagination.page + 1;

    if (!nextPage) return null;

    return await getIssues(undefined, { page: nextPage, limit: pagination.limit }, filters, sort);
  }

  let filtersOpen = $state<boolean>(false);

  // svelte-ignore non_reactive_update
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

    const encodedFilters = Object.values(filters).length === 0 ? '' : btoa(JSON.stringify(filters));

    const currentUrl = new URL(page.url);
    currentUrl.searchParams.set('filters', encodedFilters);

    await goto(currentUrl.toString(), {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });

    applyingFilters = false;
  }

  let selectedIssues = $state<IssueDetailsDto[]>([]);

  let listInstance = $state<IssuesList | undefined>(undefined);

  function handleClear() {
    listInstance?.clearSelection();
  }

  let sortingOpen = $state<boolean>(false);

  let sortByConfigInstance: SortByConfig;

  function handleSortingClick() {
    sortingOpen = !sortingOpen;

    if (!sortingOpen) {
      sortByConfigInstance?.reset();
    }
  }

  let applyingSorting = $state<boolean>(false);

  async function handleApplySorting(sortBy: IssueSortByOption) {
    applyingSorting = true;
    sortingOpen = false;

    const currentUrl = new URL(page.url);
    currentUrl.searchParams.set('sortBy', sortBy);

    await goto(`${currentUrl.pathname}?${currentUrl.searchParams.toString()}`, {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });

    applyingSorting = false;
  }

  onMount(() => {
    const issueUpdatedHandler = () => {
      handleClear();
    };

    registerIssueUpdateListener(issueUpdatedHandler);

    return () => {
      unregisterIssueUpdateListener(issueUpdatedHandler);
    };
  });

  let viewTransitionName = $state<null | string>(null);
  let gotExitConfirmation = $state<boolean>(false);

  beforeNavigate(async (navigation) => {
    // if we are navigating within the same view (but maybe different issue), set the view transition name
    if (navigation.to?.url.pathname.startsWith(`/wave/${viewKey}/issues`)) {
      viewTransitionName = `issues-list-${viewKey}`;
    } else {
      viewTransitionName = null;

      // prevent navigation (to ask for confirmation) if there are selected issues
      if (selectedIssues.length > 0 && !navigation.to?.route.id) {
        navigation.cancel();
      } else if (selectedIssues.length > 0) {
        if (gotExitConfirmation) {
          // already got confirmation, allow navigation
          return;
        }

        navigation.cancel();
        gotExitConfirmation = true;
        await doWithConfirmationModal(
          'Navigating away will discard your current selection.',
          `${navigation.to?.url.pathname}${navigation.to?.url.searchParams}`,
          () => {
            gotExitConfirmation = false;
          },
        );
      }
    }
  });

  afterNavigate(() => {
    gotExitConfirmation = false;
  });

  let noOfFilters = $derived(
    Object.keys(appliedFilters).filter((key) => key !== 'search').length - noOfPreappliedFilters,
  );

  let searchTerm = $state(appliedFilters.search ?? '');
  let searchOpen = $state(Boolean(appliedFilters.search && appliedFilters.search.length > 0));

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // debounce searchTerm, after 500ms apply search filter
  $effect(() => {
    searchTerm;

    if (!searchOpen || searchTerm.trim().length === 0) {
      return;
    }

    applyingFilters = true;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      handleApplyFilters({
        ...appliedFilters,
        ...(searchTerm.trim().length > 0 ? { search: searchTerm.trim() } : { search: undefined }),
      });
    }, 500);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  });

  let searchInputElem = $state<HTMLInputElement | null>(null);

  async function handleSearchOpen() {
    searchOpen = true;
    await tick();
    searchInputElem?.focus();
  }

  function handleSearchClose() {
    // clear search term and apply filters without search
    searchTerm = '';

    searchOpen = false;

    handleApplyFilters({
      ...appliedFilters,
      search: undefined,
    });
  }
</script>

<HeadMeta title={headMetaTitle} />

<div class="wrapper" class:isViewingIssue>
  <div class="issues" style:view-transition-name={viewTransitionName}>
    <div class="breadcrumbs-wrapper">
      <Breadcrumbs crumbs={breadcrumbs} disableViewTransitions />
    </div>

    {#if selectedIssues.length > 0}
      <div class="batch-actions" in:fade={{ duration: 150 }}>
        <span class="tnum"
          >{selectedIssues.length} issue{selectedIssues.length === 1 ? '' : 's'}</span
        >
        <div class="buttons">
          <button style="text-decoration: underline" onclick={handleClear}>Clear</button>
          <Button
            variant="primary"
            icon={Plus}
            onclick={() =>
              modal.show(
                Stepper,
                undefined,
                addIssuesToWaveFlow(ownWaveProgramRepos, selectedIssues, wavePrograms, handleClear),
              )}>Add to Wave Program</Button
          >
        </div>
      </div>
    {:else if searchOpen}
      <div class="search-bar" in:fade={{ duration: 150 }}>
        <MagnifyingGlass />
        <input
          bind:this={searchInputElem}
          bind:value={searchTerm}
          type="text"
          placeholder="Search issues..."
        />
        <button onclick={handleSearchClose} aria-label="Close search">
          <CrossCircle style="fill: var(--color-foreground-level-6)" />
        </button>
      </div>
    {:else}
      <div class="issue-list-configuration">
        <Button
          icon={MagnifyingGlass}
          disabled={filtersOpen || sortingOpen}
          onclick={handleSearchOpen}>Search</Button
        >

        <div>
          <Button
            icon={Filter}
            onclick={handleFilterClick}
            highlit={filtersOpen}
            disabled={sortingOpen}
          >
            Filter
            {#if noOfFilters > 0}
              <div class="filter-count">
                {noOfFilters}
              </div>
            {/if}
          </Button>

          <Button
            icon={SortMostToLeast}
            disabled={filtersOpen}
            highlit={sortingOpen}
            onclick={handleSortingClick}>Sort</Button
          >
        </div>
      </div>
    {/if}

    <TransitionedHeight removeFromTabIndexWhileCollapsed collapsed={!sortingOpen}>
      <div class="filter-config">
        <Card>
          <SortByConfig
            {availableSortByOptions}
            bind:this={sortByConfigInstance}
            initiallySelected={appliedSort}
            onapply={handleApplySorting}
          />
        </Card>
      </div>
    </TransitionedHeight>

    <TransitionedHeight removeFromTabIndexWhileCollapsed collapsed={!filtersOpen}>
      <div class="filter-config">
        <Card style="padding: 0;">
          {#key appliedFilters}
            <FilterConfig
              mode={filtersMode}
              {ownUserId}
              bind:this={filterConfigInstance}
              {appliedFilters}
              {defaultFilters}
              onapply={handleApplyFilters}
              {currentWaveProgram}
            />
          {/key}
        </Card>
      </div>
    </TransitionedHeight>

    <Card style="padding: 0;" disabled={filtersOpen}>
      <div class="count-badge typo-text-small">
        {issues.pagination.total}
        {issues.pagination.total === 1 ? 'match' : 'matches'}
      </div>

      {#if applyingFilters || applyingSorting}
        <div class="spinner">
          <Spinner />
        </div>
      {:else if issues.pagination.total === 0}
        <div style="padding: 1rem; ">
          <p style="padding: 1rem; text-align: center; color: var(--color-foreground-level-5);">
            No issues found matching the selected filters.
          </p>

          {#if emptyStateAnnotation}
            <div style="margin-top: 1rem">
              <AnnotationBox type="info">
                {emptyStateAnnotation}
              </AnnotationBox>
            </div>
          {/if}
        </div>
      {:else}
        <IssuesList
          {ownUserId}
          {pathPrefix}
          {showNewApplicationsBadge}
          {wavePrograms}
          bind:this={listInstance}
          multiselectMode={allowAddToWaveProgram}
          issuesWithPagination={issues}
          getMoreIssues={(currentPagination) =>
            getMoreIssues(currentPagination, appliedFilters, appliedSort)}
          onselectchange={(selected) => (selectedIssues = selected)}
          ontotalchange={(total) => (currentTotal = total)}
        />
      {/if}
    </Card>
  </div>

  <div class="content">
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
    grid-template-areas: 'issues content';
    grid-template-rows: 1fr;
    gap: 1rem;
  }

  .issues {
    grid-area: issues;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100dvh - 5.5rem);
    position: sticky;
    top: 4.5rem;
  }

  .issue-list-configuration {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    transition: opacity 0.3s;
    height: 2.25rem;
  }

  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    height: 2.25rem;
    padding: 0 0 0 1rem;
    border-radius: 1.25rem 0 1.25rem 1.25rem;
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
  }

  .batch-actions .buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .count-badge {
    position: absolute;
    bottom: -0.625rem;
    left: 50%;
    transform: translateX(-50%);
    height: 1.25rem;
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-5);
    border-radius: 1rem 0 1rem 1rem;
    z-index: 1;
    border: 1px solid var(--color-foreground-level-3);
  }

  .search-bar {
    margin-bottom: 1rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .search-bar input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    background-color: var(--color-foreground-level-1);
    border-radius: 1.125rem;
    padding: 0 1rem;
    font-size: 1rem;
    color: var(--color-foreground-level-6);
  }

  .search-bar button {
    transition: background-color 0.2s;
    border-radius: 50%;
    padding: 0.25rem;
  }

  .search-bar button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .content {
    grid-area: content;
    min-width: 0;
    position: relative;
    padding-top: 2rem;
  }

  .filter-config {
    padding-bottom: 1rem;
  }

  .filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1.25rem;
    margin-left: 0.25rem;
    width: 1.25rem;
    font-size: 0.75rem;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: white;
  }

  .spinner {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 1024px) {
    .wrapper {
      grid-template-columns: 1fr;
      grid-template-areas: 'issues';
      grid-template-rows: 1fr;
    }

    .wrapper .content {
      padding-top: 0;
    }

    .wrapper.isViewingIssue {
      grid-template-areas: 'content';
    }

    .wrapper:not(.isViewingIssue) .content {
      display: none;
    }

    .wrapper.isViewingIssue .issues {
      display: none;
    }
  }
</style>

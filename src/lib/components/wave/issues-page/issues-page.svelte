<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Filter from '$lib/components/icons/Filter.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import SortMostToLeast from '$lib/components/icons/SortMostToLeast.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import IssuesList from '$lib/components/wave/issues-page/components/issues-list/issues-list.svelte';
  import { onMount, type ComponentProps, type Snippet } from 'svelte';
  import { getIssues } from '$lib/utils/wave/issues';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import FilterConfig from './components/filter-config/filter-config.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { type IssueDetailsDto, type IssueFilters } from '$lib/utils/wave/types/issue';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import { fade } from 'svelte/transition';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import addIssuesToWaveFlow from '$lib/flows/wave/add-issues-to-wave/add-issues-to-wave-flow';
  import type { WaveDto, WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';
  import {
    registerIssueUpdateListener,
    unregisterIssueUpdateListener,
  } from './issue-update-coordinator';
  import { beforeNavigate } from '$app/navigation';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';

  let {
    issues,
    children,
    onapplyfilters,
    appliedFilters,
    breadcrumbs,
    allowAddToWave = false,
    ownWaveRepos = [],
    pathPrefix,
    waves,
    viewKey,
  }: {
    issues: Awaited<ReturnType<typeof getIssues>>;
    children: Snippet;
    appliedFilters: IssueFilters;
    onapplyfilters?: (filters: IssueFilters) => void | Promise<void>;
    breadcrumbs: ComponentProps<typeof Breadcrumbs>['crumbs'];
    allowAddToWave?: boolean;

    pathPrefix: string;

    /** For determining what Waves, if any, issues may be added to */
    ownWaveRepos?: WaveRepoWithDetailsDto[];

    /** For displaying wave data in list items */
    waves: WaveDto[];

    /** Unique name for the route the view is on to enable coherent view transitions */
    viewKey: string;
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

  let selectedIssues = $state<IssueDetailsDto[]>([]);

  let listInstance = $state<IssuesList | undefined>(undefined);

  function handleClear() {
    listInstance?.clearSelection();
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
    }

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
  });
</script>

<div class="wrapper">
  <div class="issues" style:view-transition-name={viewTransitionName}>
    <div class="breadcrumbs-wrapper">
      <Breadcrumbs crumbs={breadcrumbs} />
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
                addIssuesToWaveFlow(ownWaveRepos, selectedIssues, waves, handleClear),
              )}>Add to Wave</Button
          >
        </div>
      </div>
    {:else}
      <div class="issue-list-configuration">
        <Button icon={MagnifyingGlass}>Search</Button>

        <div>
          <Button icon={Filter} onclick={handleFilterClick} highlit={filtersOpen}>Filter</Button>
          <Button icon={SortMostToLeast}>Sort</Button>
        </div>
      </div>
    {/if}

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
      {:else if issues.pagination.total === 0}
        <div style="padding: 2rem; text-align: center; color: var(--color-foreground-level-5);">
          No issues found matching the selected filters.
        </div>
      {:else}
        <IssuesList
          {pathPrefix}
          {waves}
          bind:this={listInstance}
          multiselectMode={allowAddToWave}
          issuesWithPagination={issues}
          getMoreIssues={(currentPagination) => getMoreIssues(currentPagination, appliedFilters)}
          onselectchange={(selected) => (selectedIssues = selected)}
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

  .content {
    min-width: 0;
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

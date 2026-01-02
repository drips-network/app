<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import TableViewConfigurator from '$lib/components/table-view-configurator/table-view-configurator.svelte';
  import { decisionsStore } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import buildUrl from '$lib/utils/build-url.js';
  import downloadUrl from '$lib/utils/download-url.js';
  import { getApplicationsCsv, getApplicationsXlsx } from '$lib/utils/rpgf/rpgf.js';
  import { fade } from 'svelte/transition';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import type { Writable } from 'svelte/store';
  import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
  import type { ApplicationCategory, ListingApplication } from '$lib/utils/rpgf/types/application';
  import { page } from '$app/state';
  import type { FilterParam, SortByParam } from '../+layout';
  import type { TDropdownOption } from '$lib/components/table-view-configurator/components/mini-dropdown.svelte';

  interface Props {
    round: Round;
    ballotStore: Writable<InProgressBallot> & {
      clear: () => void;
    };
    sortByParam: SortByParam;
    filterParam: FilterParam | null;
    loggedIn: boolean;
    categories: ApplicationCategory[];
    voteMode: boolean;
    reviewMode: boolean;
    allApplications: ListingApplication[];
    tableConfiguratorEl?: HTMLDivElement | undefined;
  }

  let {
    round,
    ballotStore,
    sortByParam,
    filterParam,
    loggedIn,
    categories,
    voteMode,
    reviewMode,
    allApplications,
    tableConfiguratorEl = $bindable(),
  }: Props = $props();

  async function handleDownload(format: 'csv' | 'xlsx') {
    const content: Blob | string =
      format === 'csv'
        ? await getApplicationsCsv(undefined, round.id)
        : await getApplicationsXlsx(undefined, round.id);

    const fileType =
      format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const fileName =
      format === 'csv' ? `applications-${round.urlSlug}.csv` : `applications-${round.urlSlug}.xlsx`;

    downloadUrl(URL.createObjectURL(new Blob([content], { type: fileType })), fileName);
  }

  let selectedSortBy: SortByParam = $state(sortByParam);
  let selectedFilter: FilterParam | null = $state(filterParam);

  async function handleTableOptsChange({
    sortBy,
    filterBy,
  }: {
    sortBy: string | null;
    filterBy: string | null;
  }) {
    let sortByToSet = sortBy ?? 'createdAt';

    selectedSortBy = sortByToSet as SortByParam;
    selectedFilter = filterBy as FilterParam | null;

    await goto(
      buildUrl(page.url.pathname, {
        sortBy: sortByToSet,
        filter: filterBy ?? null,
      }),
      { replaceState: true, noScroll: true },
    );
  }

  let filterOptions: Record<FilterParam, TDropdownOption> = $derived({
    ...(loggedIn ? { own: { label: 'My applications' } } : {}),

    pending: { label: 'Pending' },
    approved: { label: 'Approved' },
    rejected: { label: 'Rejected' },

    ...Object.fromEntries(categories.map((cat) => [`cat-${cat.id}`, { label: cat.name }])),
  } as Record<FilterParam, TDropdownOption>);
</script>

<div>
  <Button href="/app/rpgf/rounds/{round.urlSlug}" icon={ArrowLeft}>Back to round</Button>
</div>

{#if !loggedIn}
  <div transition:fade={{ duration: 300 }}>
    <AnnotationBox type="info">
      Sign in to RetroPGF on Drips to see your own applications, vote on applications, or view
      private data if you're an admin.
      {#snippet actions()}
        <RpgfSiweButton />
      {/snippet}
    </AnnotationBox>
  </div>
{/if}

<div class="apps-pane">
  <div class="header">
    <h1>Applications</h1>
    <div class="table-setting">
      <TableViewConfigurator
        bind:el={tableConfiguratorEl}
        sortByOptions={{
          name: { label: 'Project name' },
          createdAt: { label: 'Created at' },

          ...(round.isAdmin || round.resultsPublished
            ? { allocation: { label: 'Allocation amount' } }
            : null),
        }}
        {filterOptions}
        onDownload={handleDownload}
        sortBy={selectedSortBy}
        filterBy={selectedFilter}
        onFilterChange={(filterBy) => handleTableOptsChange({ sortBy: selectedSortBy, filterBy })}
        onSortChange={(sortBy) => handleTableOptsChange({ sortBy, filterBy: selectedFilter })}
      />
    </div>
  </div>

  <RpgfApplicationsTable
    voteStep={voteMode ? 'build-ballot' : undefined}
    {reviewMode}
    bind:decisions={$decisionsStore}
    {round}
    {ballotStore}
    applications={allApplications}
    signedIn={loggedIn}
    displayVisibilityNote={!round.isAdmin}
  />
</div>

<style>
  .apps-pane {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1px;
  }

  h1 {
    font-size: 1.75rem;
  }

  .header {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .table-setting {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
</style>

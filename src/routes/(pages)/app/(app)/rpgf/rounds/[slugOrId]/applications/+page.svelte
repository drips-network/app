<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import TableViewConfigurator from '$lib/components/table-view-configurator/table-view-configurator.svelte';
  import { decisionsStore } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import buildUrl from '$lib/utils/build-url.js';
  import downloadUrl from '$lib/utils/download-url.js';
  import { getApplicationsCsv } from '$lib/utils/rpgf/rpgf.js';
  import { fade } from 'svelte/transition';

  export let data;
  $: round = data.round;
  $: ballotStore = data.ballot;

  async function handleDownload() {
    const csvContent = await getApplicationsCsv(undefined, round.id);

    downloadUrl(
      URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' })),
      `applications-${round.urlSlug}.csv`,
    );
  }

  let selectedSortBy = data.sortByParam;
  let selectedFilter = data.filterParam;

  $: {
    if (selectedSortBy !== data.sortByParam || selectedFilter !== data.filterParam) {
      goto(
        buildUrl(`/app/rpgf/rounds/${round.urlSlug}/applications`, {
          sortBy: selectedSortBy,
          filter: selectedFilter ?? '',
        }),
        {
          replaceState: true,
        },
      );
    }
  }
  $: imageBaseUrl = `/api/share-images/rpgf-round/${encodeURIComponent(round.id)}.png`;
</script>

<HeadMeta
  title="Applications | {round.name}"
  description="Applications for the RetroPGF round '{round.name}'. {round.description ?? ''}"
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<div class="page">
  <div><Button href="/app/rpgf/rounds/{round.urlSlug}" icon={ArrowLeft}>Back to round</Button></div>

  {#if !data.rpgfUserData}
    <div transition:fade={{ duration: 300 }}>
      <AnnotationBox type="info">
        Sign in to Drips RPGF to see your own applications, vote on applications, or view private
        data if you're an admin.
        <svelte:fragment slot="actions">
          <RpgfSiweButton />
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}

  <div class="header">
    <h1>Applications</h1>
    <div class="table-setting">
      <TableViewConfigurator
        sortByOptions={{
          name: 'Name',
          createdAt: 'Created at',
          allocation: round.isAdmin || round.resultsPublished ? 'Allocation amount' : null,
        }}
        bind:sortBy={selectedSortBy}
        filterOptions={{
          own: data.rpgfUserData ? 'Only my applications' : null,
          pending: 'Only pending',
          approved: 'Only approved',
        }}
        bind:filterBy={selectedFilter}
        onDownload={handleDownload}
      />
    </div>
  </div>

  <RpgfApplicationsTable
    voteStep={data.voteMode ? 'build-ballot' : undefined}
    reviewMode={data.reviewMode}
    bind:decisions={$decisionsStore}
    {round}
    {ballotStore}
    applications={data.allApplications}
  />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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

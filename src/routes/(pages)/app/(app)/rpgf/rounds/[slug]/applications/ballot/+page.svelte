<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable, {
    GroupBy,
  } from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';

  export let data;
  $: ballotStore = data.ballot;

  $: roundSlug = data.wrappedRound.round.urlSlug;

  $: selectedApplications = mapFilterUndefined(Object.keys($ballotStore), (id) => {
    return data.applications.find((app) => app.id === id);
  });
</script>

<div class="page">
  <div>
    <Button href="/app/rpgf/rounds/{roundSlug}/applications" icon={ArrowLeft}
      >Back to applications</Button
    >
  </div>
  <div class="header">
    <h1>Your ballot</h1>
  </div>

  <RpgfApplicationsTable
    voteStep="assign-votes"
    groupBy={GroupBy.None}
    reviewMode={false}
    userData={data.rpgfUserData}
    round={data.wrappedRound.round}
    {ballotStore}
    applications={selectedApplications}
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
    align-items: center;
    justify-content: space-between;
  }
</style>

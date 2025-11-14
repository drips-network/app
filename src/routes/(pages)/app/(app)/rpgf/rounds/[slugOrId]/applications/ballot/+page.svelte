<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined.js';
  import ThreePaneLayout from '../shared/three-pane-layout.svelte';

  let { data } = $props();
  let ballotStore = $derived(data.ballot);

  let selectedApplications = $derived(mapFilterUndefined(Object.keys($ballotStore), (id) => {
    return data.allApplications.find((app) => app.id === id);
  }));
</script>

<HeadMeta title="Your ballot" />

<ThreePaneLayout hideAppsPane {...data}>
  <div class="page">
    <div>
      <Button href="/app/rpgf/rounds/{data.round.urlSlug}/applications" icon={ArrowLeft}
        >Back to applications</Button
      >
    </div>
    <div class="header">
      <h1>Your ballot</h1>
    </div>

    <RpgfApplicationsTable
      voteStep="assign-votes"
      reviewMode={false}
      round={data.round}
      {ballotStore}
      applications={selectedApplications}
      horizontalScroll
      signedIn={data.rpgfUserData !== undefined}
    />
  </div>
</ThreePaneLayout>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1024px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>

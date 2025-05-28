<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';

  export let data;

  $: roundSlug = data.wrappedRound.round.urlSlug;
</script>

<div class="page">
  <div><Button href="/app/rpgf/rounds/{roundSlug}" icon={ArrowLeft}>Back to round</Button></div>
  <h1>Applications</h1>

  <RpgfApplicationsTable
    userIsAdmin={data.isRoundAdmin}
    userData={data.rpgfUserData}
    {roundSlug}
    applications={data.applications}
  />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable, {
    GroupBy,
  } from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import { z } from 'zod';

  export let data;
  $: decisionsStore = data.decisions;
  $: ballotStore = data.ballot;

  $: roundSlug = data.wrappedRound.round.urlSlug;

  const groupByOptions = data.isRoundAdmin
    ? [
        { title: 'None', value: GroupBy.None },
        { title: 'My applications', value: GroupBy.Mine },
        { title: 'State', value: GroupBy.State },
      ]
    : [
        { title: 'None', value: GroupBy.None },
        { title: 'My applications', value: GroupBy.Mine },
      ];

  $: defaultGroupBy = data.isRoundAdmin ? GroupBy.State : GroupBy.Mine;

  const groupBy = storedWritable<GroupBy>(
    'applications-view-group-by',
    z.enum([GroupBy.Mine, GroupBy.None, GroupBy.State]),
    defaultGroupBy,
  );

  $: {
    if (!groupByOptions.some(option => option.value === $groupBy)) {
      groupBy.set(defaultGroupBy);
    }
  }

  $: console.log($ballotStore)

  let votingModeStep: 'build-ballot' | 'assign-votes' | null;
  $: {

  }
</script>

<div class="page">
  <div><Button href="/app/rpgf/rounds/{roundSlug}" icon={ArrowLeft}>Back to round</Button></div>
  <div class="header">
    <h1>Applications</h1>
    <div class="table-setting">
      <span>Group by</span>
      <Dropdown options={groupByOptions} bind:value={$groupBy} />
    </div>
  </div>

  <RpgfApplicationsTable
    bind:groupBy={$groupBy}
    reviewMode={data.reviewMode}
    bind:decisions={$decisionsStore}
    userData={data.rpgfUserData}
    {roundSlug}
    {ballotStore}
    applications={data.applications}
  />
</div>

<style>
  .page {
    grid-area: page;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .table-setting {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    min-width: 16rem;
  }
</style>

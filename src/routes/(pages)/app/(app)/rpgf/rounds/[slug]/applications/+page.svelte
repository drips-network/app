<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationsTable, {
    GroupBy,
  } from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import { fade } from 'svelte/transition';
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
    : data.rpgfUserData
      ? [
          { title: 'None', value: GroupBy.None },
          { title: 'My applications', value: GroupBy.Mine },
        ]
      : [{ title: 'None', value: GroupBy.None }];

  let defaultGroupBy: GroupBy = GroupBy.State;
  if (data.voteMode) {
    defaultGroupBy = GroupBy.State;
  } else if (data.isRoundAdmin) {
    defaultGroupBy = GroupBy.State;
  } else {
    defaultGroupBy = GroupBy.Mine;
  }

  const groupBy = storedWritable<GroupBy>(
    'applications-view-group-by',
    z.enum([GroupBy.Mine, GroupBy.None, GroupBy.State]),
    defaultGroupBy,
  );

  $: {
    if (!groupByOptions.some((option) => option.value === $groupBy)) {
      groupBy.set(defaultGroupBy);
    }
  }
</script>

<div class="page">
  <div><Button href="/app/rpgf/rounds/{roundSlug}" icon={ArrowLeft}>Back to round</Button></div>

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
      <span>Group by</span>
      <Dropdown options={groupByOptions} bind:value={$groupBy} />
    </div>
  </div>

  <RpgfApplicationsTable
    voteStep={data.voteMode ? 'build-ballot' : undefined}
    bind:groupBy={$groupBy}
    reviewMode={data.reviewMode}
    bind:decisions={$decisionsStore}
    userData={data.rpgfUserData}
    round={data.wrappedRound.round}
    {ballotStore}
    applications={data.applications}
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

  .table-setting {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    min-width: 16rem;
  }
</style>

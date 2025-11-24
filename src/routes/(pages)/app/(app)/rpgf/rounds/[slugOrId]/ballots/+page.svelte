<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Download from '$lib/components/icons/Download.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Table from '$lib/components/table/table.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import downloadUrl from '$lib/utils/download-url.js';
  import formatDate from '$lib/utils/format-date.js';
  import { getBallotsCsv } from '$lib/utils/rpgf/rpgf.js';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import rpgfAdminBallotUploadFlowSteps from '$lib/flows/rpgf-admin-ballot-upload/rpgf-admin-ballot-upload-flow-steps';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';
  import Sharrow from '$lib/components/icons/Sharrow.svelte';

  export let data;

  interface BallotTableRow {
    voter: ComponentProps<IdentityBadge>;
    submittedAt: string;
    votesAssigned: string;
  }

  $: tableData = data.ballots.map<BallotTableRow>((ballot) => ({
    voter: {
      address: ballot.user.walletAddress,
    },
    submittedAt: formatDate(ballot.createdAt),
    votesAssigned: `${Object.values(ballot.ballot).reduce<number>((acc, v) => acc + v, 0)} / ${data.round.maxVotesPerVoter}`,
  }));

  const tableColumns: ColumnDef<BallotTableRow>[] = [
    {
      header: 'Voter',
      accessorKey: 'voter',
      enableSorting: false,
      cell: () => IdentityBadge,
    },
    {
      header: 'Votes assigned',
      accessorKey: 'votesAssigned',
      enableSorting: false,
      cell: (c) => c,
    },
    {
      header: 'Ballot submitted at',
      accessorKey: 'submittedAt',
      enableSorting: false,
      cell: (c) => c,
    },
  ];

  $: tableOptions = {
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  $: resultsPeriodStart = data.round.resultsPeriodStart
    ? data.round.resultsPeriodStart instanceof Date
      ? data.round.resultsPeriodStart
      : new Date(data.round.resultsPeriodStart)
    : null;

  $: distributionPhaseStarted = resultsPeriodStart
    ? resultsPeriodStart.getTime() <= Date.now()
    : false;

  $: canAdminUploadBallot = data.round.isAdmin && !distributionPhaseStarted;

  async function handleDownload() {
    const csvContent = await getBallotsCsv(undefined, data.round.id);

    downloadUrl(
      URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' })),
      `ballots-${data.round.urlSlug}.csv`,
    );
  }

  function openAdminUploadFlow() {
    modal.show(
      Stepper,
      undefined,
      rpgfAdminBallotUploadFlowSteps(data.round, data.voters ?? [], data.ballots ?? []),
    );
  }
</script>

<HeadMeta title="Ballots | {data.round.name}" />

<div class="page">
  <div>
    <Button href="/app/rpgf/rounds/{data.round.urlSlug}" icon={ArrowLeft}>Back to round</Button>
  </div>

  <div class="header">
    <h1>Ballots</h1>
    <div class="actions">
      {#if canAdminUploadBallot}
        <Button icon={Sharrow} variant="ghost" on:click={openAdminUploadFlow}
          >Manually upload ballot</Button
        >
      {/if}
      <Button icon={Download} variant="primary" on:click={() => doWithErrorModal(handleDownload)}
        >Download CSV</Button
      >
    </div>
  </div>

  <PaddedHorizontalScroll>
    <Table rowHeight={48} options={tableOptions} isRowClickable={false} />
  </PaddedHorizontalScroll>
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
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

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
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';
  import type { ComponentProps } from 'svelte';

  export let data;

  interface BallotTableRow {
    voter: ComponentProps<IdentityBadge>;
    submittedAt: string;
    votesAssigned: string;
  }

  $: tableData = data.ballots.map<BallotTableRow>((ballot) => ({
    voter: {
      address: ballot.voter.walletAddress,
    },
    submittedAt: formatDate(ballot.createdAt),
    votesAssigned: `${Object.values(ballot.ballot).reduce<number>((acc, v) => acc + v, 0)} / ${data.wrappedRound.round.votingConfig.maxVotesPerVoter}`,
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

  async function handleDownload() {
    const csvContent = await getBallotsCsv(undefined, data.wrappedRound.round.urlSlug);

    downloadUrl(
      URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' })),
      `ballots-${data.wrappedRound.round.urlSlug}.csv`,
    );
  }
</script>

<HeadMeta title="Ballots | {data.wrappedRound.round.name}" />

<div class="page">
  <div>
    <Button href="/app/rpgf/rounds/{data.wrappedRound.round.urlSlug}" icon={ArrowLeft}>
      Back to round
    </Button>
  </div>

  <div class="header">
    <h1>Ballots</h1>
    <Button icon={Download} variant="ghost" on:click={() => doWithErrorModal(handleDownload)}
      >Download CSV</Button
    >
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
</style>

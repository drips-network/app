<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef } from '@tanstack/svelte-table';

  let { data } = $props();

  const { round, externalVoteResult, category, applications } = data;

  const voterAddress = data.rpgfUserData?.walletAddress ?? '';
  const addressMatches =
    voterAddress.toLowerCase() === externalVoteResult.voterAddress.toLowerCase();

  const applicationNamesById = $derived(
    Object.fromEntries(applications.map((a) => [a.id, a.projectName])),
  );

  interface VoteRow {
    project: string;
    votes: number;
  }

  const voteRows: VoteRow[] = $derived(
    Object.entries(externalVoteResult.votes)
      .map(([applicationId, votes]) => ({
        project: applicationNamesById[applicationId] ?? `Unknown (${applicationId})`,
        votes,
      }))
      .sort((a, b) => b.votes - a.votes),
  );

  const totalVotes = $derived(voteRows.reduce((acc, r) => acc + r.votes, 0));

  const tableColumns: ColumnDef<VoteRow>[] = [
    {
      header: 'Project',
      accessorKey: 'project',
      enableSorting: false,
      cell: (c) => c,
    },
    {
      header: 'Votes',
      accessorKey: 'votes',
      enableSorting: false,
      cell: (c) => c,
    },
  ];

  const tableOptions = $derived({
    data: voteRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  let committing = $state(false);
  function handleCommit() {
    // TODO: Wire up to the real draft-vote API once that flow lands.
    committing = true;
    setTimeout(() => {
      committing = false;
      alert(
        'Prototype: Votes would now be committed to your draft ballot for this category. ' +
          'Real wiring is not implemented yet.',
      );
    }, 400);
  }
</script>

<HeadMeta title="External vote results | {round.name ?? 'RetroPGF'}" />

<div class="page">
  <div>
    <Button href="/app/rpgf/rounds/{round.urlSlug}" icon={ArrowLeft}>Back to round</Button>
  </div>

  <div class="header">
    <h1>Review external votes</h1>
    <p class="typo-text">
      You've returned from
      {#if category?.externalVotingTool}
        <span class="typo-text-bold">{category.externalVotingTool.name}</span>.
      {:else}
        an external voting tool.
      {/if}
      Review the votes below before committing them to your ballot for the
      {#if category}
        <span class="typo-text-bold">{category.name}</span> category.
      {:else}
        selected category.
      {/if}
    </p>
  </div>

  {#if !addressMatches}
    <AnnotationBox type="warning">
      These votes were submitted for wallet
      <span class="typo-text-small-bold">{externalVoteResult.voterAddress}</span>, but you are
      currently signed in as
      <span class="typo-text-small-bold">{voterAddress}</span>. Please switch wallets to continue.
    </AnnotationBox>
  {/if}

  <div class="meta">
    <div class="meta-row">
      <span class="label">Voter</span>
      <IdentityBadge address={externalVoteResult.voterAddress} />
    </div>
    <div class="meta-row">
      <span class="label">Category</span>
      <span class="typo-text">{category?.name ?? externalVoteResult.categoryId}</span>
    </div>
    <div class="meta-row">
      <span class="label">Total votes</span>
      <span class="typo-text">{totalVotes}</span>
    </div>
    <div class="meta-row">
      <span class="label">Projects with votes</span>
      <span class="typo-text">{voteRows.filter((r) => r.votes > 0).length}</span>
    </div>
  </div>

  {#if voteRows.length === 0}
    <AnnotationBox type="info">
      The external tool didn't return any votes for this category.
    </AnnotationBox>
  {:else}
    <PaddedHorizontalScroll>
      <Table rowHeight={48} options={tableOptions} isRowClickable={false} />
    </PaddedHorizontalScroll>
  {/if}

  <AnnotationBox type="info">
    Committing will replace any existing draft votes you have for this category. You can still edit
    your ballot afterwards before final submission.
  </AnnotationBox>

  <div class="actions">
    <Button variant="ghost" href="/app/rpgf/rounds/{round.urlSlug}">Reject and go back</Button>
    <Button
      variant="primary"
      icon={CheckCircle}
      disabled={!addressMatches || voteRows.length === 0}
      loading={committing}
      onclick={handleCommit}
    >
      Accept and add to ballot
    </Button>
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 56rem;
    margin: 0 auto;
    width: 100%;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: var(--elevation-low);
  }

  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .label {
    color: var(--color-foreground-level-5);
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>

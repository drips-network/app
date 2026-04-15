<script lang="ts">
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Section from '$lib/components/section/section.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import WaveBadge from '$lib/components/wave/wave-program-badge/wave-program-badge.svelte';
  import MultiSelectFilter from '$lib/components/wave/repos-filter-bar/multi-select-filter.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram.js';
  import { goto } from '$app/navigation';

  let { data } = $props();

  let { wavePrograms, waveProgramRepos, statusFilter } = $derived(data);

  const statusOptions = Promise.resolve([
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
  ]);

  let selectedStatus = $derived(statusFilter ? [statusFilter] : []);

  function handleStatusChange(values: string[]) {
    const url = new URL(window.location.href);
    if (values.length > 0) {
      url.searchParams.set('status', values[0]);
    } else {
      url.searchParams.delete('status');
    }
    goto(url.pathname + url.search, { invalidateAll: true, replaceState: true });
  }
</script>

{#snippet waveProgramRepo(d: WaveProgramRepoWithDetailsDto)}
  {@const waveProgram = wavePrograms.data.find((w) => w.id === d.waveProgramId)}
  <div class="repo-application-item typo-text">
    <div class="name-and-wave-and-date">
      <div class="name-and-wave">
        <RepoBadge clamp={false} repo={d.repo} /> → {#if waveProgram}
          <!-- Really need to align these sizes 😵‍💫 -->
          <WaveBadge {waveProgram} size="large" />
        {/if}
      </div>

      <span class="typo-text-small" style:color="var(--color-foreground-level-5)">
        {formatDate(d.appliedAt)}
      </span>
    </div>

    <div class="status-and-budget">
      {#if d.pointsBudget !== null && d.status === 'approved'}
        <span
          class="budget typo-text-small"
          class:over-budget={d.pointsRemaining !== null && d.pointsRemaining <= 0}
          class:low-budget={d.pointsRemaining !== null &&
            d.pointsRemaining > 0 &&
            d.pointsRemaining <= d.pointsBudget * 0.2}
        >
          {d.pointsUsed} / {d.pointsBudget}
        </span>
      {:else}
        <span class="budget typo-text-small">&mdash;</span>
      {/if}

      <div class="status typo-text-small">
        {#if d.status === 'pending'}
          <span>Pending review</span>
        {:else if d.status === 'approved'}
          <span class="typo-text-small-bold" style:color="var(--color-positive-level-6)">
            Approved
          </span>
        {:else if d.status === 'rejected'}
          <span class="typo-text-small-bold" style:color="var(--color-negative-level-6)">
            Rejected
          </span>
        {/if}
      </div>
    </div>
  </div>
{/snippet}

<HeadMeta title="Orgs & Repos | Maintainer Dashboard" />

<div class="page">
  <div style:view-transition-name="repos-breadcrumbs">
    <Breadcrumbs crumbs={[{ label: 'Maintainer Dashboard' }, { label: 'Orgs & Repos' }]} />
  </div>
  <div style:view-transition-name="repos-section">
    <Section
      header={{
        label: 'Repo Applications',
        icon: Ledger,
        actions: [
          {
            label: 'Add repos',
            icon: Plus,
            variant: 'primary',
            disabled: false,
            href: `/wave/maintainer-onboarding/install-app?onCancelGoto=/wave/maintainers/repos`,
          },
        ],
        infoTooltip:
          "Before you can add issues to a Wave, the source repo must be accepted by the Wave's organizers. This list shows the status of your repo applications.",
      }}
      skeleton={{
        loaded: true,
        empty: waveProgramRepos.pagination.total === 0 && !statusFilter,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No repo applications yet',
        emptyStateText: 'Add a repo and apply it to a Wave Program to get started.',
        horizontalScroll: true,
      }}
    >
      <div class="filter-row" style:view-transition-name="repos-filter">
        <div class="filter-item">
          <span class="filter-label typo-text-small">Status</span>
          <div class="filter-dropdown">
            <MultiSelectFilter
              optionsPromise={statusOptions}
              selectedValues={selectedStatus}
              onchange={handleStatusChange}
              placeholder="All"
              singleSelect
            />
          </div>
        </div>
      </div>

      {#if waveProgramRepos.data.length === 0 && statusFilter}
        <div class="filtered-empty-state">
          <p class="typo-text-small-bold">No {statusFilter} repos</p>
          <p class="typo-text-small" style:color="var(--color-foreground-level-5)">
            None of your repos have this status.
          </p>
        </div>
      {:else if waveProgramRepos.data.length > 0}
        <div class="list-header typo-header-5">
          <span></span>
          <div class="header-right">
            <div class="header-budget">
              <span>Points budget</span>
              <Tooltip>
                <InfoCircle
                  style="height: 1rem; width: 1rem; fill: var(--color-foreground-level-5);"
                />
                {#snippet tooltip_content()}
                  <span class="typo-text-small"
                    >Each approved repo can use up to the program's per-repo points budget per wave. <a
                      href="https://docs.drips.network/wave/maintainers/points-budgets"
                      target="_blank"
                      class="typo-link">Learn more</a
                    ></span
                  >
                {/snippet}
              </Tooltip>
            </div>
            <span class="header-status">Status</span>
          </div>
        </div>
        <div class="repo-applications-list">
          {#each waveProgramRepos.data as repoApplication (repoApplication.id)}
            {@render waveProgramRepo(repoApplication)}
          {/each}
        </div>
      {/if}
    </Section>
  </div>
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .filter-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .filter-item {
    display: flex;
    align-items: stretch;
    background: var(--color-foreground-level-1);
    border-radius: 0.5rem;
    height: 2.25rem;
    box-sizing: border-box;
  }

  .filter-label {
    color: var(--color-foreground-level-6);
    white-space: nowrap;
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .filter-dropdown {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: stretch;
  }

  .filtered-empty-state {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 16rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }

  .repo-applications-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .repo-application-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .repo-application-item:last-child {
    border-bottom: none;
  }

  .repo-application-item .name-and-wave {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem 0.5rem;
    color: var(--color-foreground-level-5);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .header-budget {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 6rem;
    justify-content: flex-end;
    white-space: nowrap;
  }

  .header-budget :global(.tooltip-content) {
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
  }

  .header-status {
    width: 6rem;
    text-align: right;
  }

  .status-and-budget {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-shrink: 0;
  }

  .budget {
    width: 6rem;
    text-align: right;
    color: var(--color-foreground-level-5);
  }

  .budget.over-budget {
    color: var(--color-negative-level-6);
  }

  .budget.low-budget {
    color: var(--color-caution-level-6);
  }

  .status {
    width: 6rem;
    text-align: right;
    white-space: nowrap;
  }
</style>

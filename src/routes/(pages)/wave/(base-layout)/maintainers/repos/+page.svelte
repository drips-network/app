<script lang="ts">
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Section from '$lib/components/section/section.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import OrgPreviewCard from '$lib/components/wave/org-preview-card/org-preview-card.svelte';
  import WaveBadge from '$lib/components/wave/wave-program-badge/wave-program-badge.svelte';
  import MultiSelectFilter from '$lib/components/wave/repos-filter-bar/multi-select-filter.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import ArrowReply from '$lib/components/icons/ArrowReply.svelte';
  import formatDate from '$lib/utils/format-date';
  import type {
    RepoAppealEligibility,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram.js';
  import { goto } from '$app/navigation';

  let { data } = $props();

  let { wavePrograms, waveProgramRepos, approvedWaveProgramRepos, statusFilter } = $derived(data);

  type OrgEntry = {
    org: WaveProgramRepoWithDetailsDto['org'];
    waveProgramId: string;
    orgPointsBudget: number | null;
    orgPointsUsed: number;
    orgPointsRemaining: number | null;
  };

  // One entry per (waveProgramId, orgId) from the user's approved repos.
  // Each approved repo carries the org's per-wave-program budget, so picking one
  // repo per (waveProgramId, orgId) is enough to drive the gauge.
  let orgEntries: OrgEntry[] = $derived.by(() => {
    const seen: Record<string, true> = {};
    const entries: OrgEntry[] = [];
    for (const r of approvedWaveProgramRepos.data) {
      const key = `${r.waveProgramId}:${r.org.id}`;
      if (seen[key]) continue;
      seen[key] = true;
      entries.push({
        org: r.org,
        waveProgramId: r.waveProgramId,
        orgPointsBudget: r.orgPointsBudget ?? null,
        orgPointsUsed: r.orgPointsUsed ?? 0,
        orgPointsRemaining: r.orgPointsRemaining ?? null,
      });
    }
    return entries;
  });

  // Distinct wave programs the user has any approved repo in. Drives the
  // wave-program dropdown in the Orgs section.
  let orgsWavePrograms = $derived(
    wavePrograms.data.filter((wp) => orgEntries.some((e) => e.waveProgramId === wp.id)),
  );

  let selectedOrgsWaveProgramId = $state<string | null>(null);

  // Default the selection to the first available wave program. Reset if the
  // current selection is no longer in the list.
  $effect(() => {
    if (orgsWavePrograms.length === 0) {
      selectedOrgsWaveProgramId = null;
      return;
    }
    if (
      selectedOrgsWaveProgramId === null ||
      !orgsWavePrograms.some((wp) => wp.id === selectedOrgsWaveProgramId)
    ) {
      selectedOrgsWaveProgramId = orgsWavePrograms[0].id;
    }
  });

  let orgsWaveProgramOptions = $derived(
    Promise.resolve(orgsWavePrograms.map((wp) => ({ value: wp.id, label: wp.name }))),
  );

  let orgsForSelectedWave = $derived(
    selectedOrgsWaveProgramId
      ? orgEntries
          .filter((e) => e.waveProgramId === selectedOrgsWaveProgramId)
          .sort((a, b) => a.org.gitHubOrgLogin.localeCompare(b.org.gitHubOrgLogin))
      : [],
  );

  function handleOrgsWaveProgramChange(values: string[]) {
    if (values.length > 0) selectedOrgsWaveProgramId = values[0];
  }

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
    goto(url.pathname + url.search, { replaceState: true });
  }

  // Whole days from now until `date`, rounded up (never negative).
  function daysUntil(date: Date): number {
    const ms = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  // Explanation shown in the Appeal button's tooltip when it's disabled. Returns
  // null when the user can appeal (button enabled, no tooltip needed).
  function appealDisabledReason(appeal: RepoAppealEligibility): string | null {
    if (appeal.canAppeal) return null;
    if (appeal.latestAppealStatus === 'pending') {
      return 'Your appeal is currently pending review.';
    }
    if (appeal.appealsRemaining <= 0) {
      return 'You’ve used all appeals available for this repository.';
    }
    if (appeal.nextAppealAllowedAt) {
      const days = daysUntil(appeal.nextAppealAllowedAt);
      if (days > 0) {
        return `You can submit an appeal in ${days} day${days === 1 ? '' : 's'}.`;
      }
    }
    return 'You can’t appeal this rejection right now.';
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
          {#if d.appeal?.latestAppealStatus === 'pending'}
            <span class="typo-text-small-bold" style:color="var(--color-caution-level-6)">
              Appeal pending
            </span>
          {:else}
            <span class="typo-text-small-bold" style:color="var(--color-negative-level-6)">
              Rejected
            </span>
          {/if}
          {#if d.appeal}
            {@const disabledReason = appealDisabledReason(d.appeal)}
            <Tooltip disabled={!disabledReason}>
              <Button
                variant="normal"
                size="small"
                icon={ArrowReply}
                disabled={!d.appeal.canAppeal}
                href={d.appeal.canAppeal
                  ? `/wave/appeal/${d.waveProgramId}/${d.repo.id}`
                  : undefined}
              >
                Appeal
              </Button>
              {#snippet tooltip_content()}
                <span class="typo-text-small">{disabledReason}</span>
              {/snippet}
            </Tooltip>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/snippet}

<HeadMeta title="Orgs & Repos | Maintainer Dashboard" />

<div
  class="page"
  style:view-transition-name="maintainers-repos-page-content"
  style:view-transition-class="element-handover"
>
  <Breadcrumbs crumbs={[{ label: 'Maintainer Dashboard' }, { label: 'Orgs & Repos' }]} />

  <Section
    header={{
      label: 'Orgs',
      icon: Orgs,
      actions: [
        {
          label: 'Add org',
          icon: Plus,
          variant: 'primary',
          disabled: false,
          href: `/wave/maintainer-onboarding/install-app?onCancelGoto=/wave/maintainers/repos`,
        },
      ],
      infoTooltip:
        "Orgs you're a member of that have at least one repo approved in the selected Wave Program, alongside each org's points limit for that Wave.",
    }}
    skeleton={{
      loaded: true,
      empty: orgEntries.length === 0,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No orgs yet',
      emptyStateText: "Once one of your org's repos is approved for a Wave, it'll show up here.",
      horizontalScroll: true,
    }}
  >
    {#if orgEntries.length > 0}
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label typo-text-small">Wave Program</span>
          <div class="filter-dropdown">
            <MultiSelectFilter
              optionsPromise={orgsWaveProgramOptions}
              selectedValues={selectedOrgsWaveProgramId ? [selectedOrgsWaveProgramId] : []}
              onchange={handleOrgsWaveProgramChange}
              placeholder="Select wave"
              singleSelect
            />
          </div>
        </div>
      </div>

      <div class="orgs-grid">
        {#each orgsForSelectedWave as entry (entry.org.id)}
          {@const budgetSet = entry.orgPointsBudget !== null}
          {@const overBudget =
            budgetSet && entry.orgPointsRemaining !== null && entry.orgPointsRemaining <= 0}
          {@const lowBudget =
            budgetSet &&
            entry.orgPointsRemaining !== null &&
            entry.orgPointsRemaining > 0 &&
            entry.orgPointsRemaining <= (entry.orgPointsBudget ?? 0) * 0.2}
          <OrgPreviewCard
            org={{
              id: entry.org.id,
              gitHubOrgLogin: entry.org.gitHubOrgLogin,
              gitHubOrgAvatarUrl: entry.org.gitHubOrgAvatarUrl,
              contactInfo: null,
            }}
          >
            {#snippet actions()}
              <div class="org-card-footer">
                <div class="org-card-budget">
                  <span class="org-card-budget-label typo-text-small">
                    <span style:color="var(--color-foreground-level-5)">Points budget</span>
                    <Tooltip>
                      <InfoCircle
                        style="height: 0.875rem; width: 0.875rem; fill: var(--color-foreground-level-5);"
                      />
                      {#snippet tooltip_content()}
                        <span class="typo-text-small"
                          >Each org has a points budget per Wave, shared across all of the org's
                          approved repos. <a
                            href="https://docs.drips.network/wave/maintainers/points-budgets"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="typo-link">Learn more</a
                          ></span
                        >
                      {/snippet}
                    </Tooltip>
                  </span>
                  {#if budgetSet}
                    <span
                      class="budget typo-text-small"
                      class:over-budget={overBudget}
                      class:low-budget={lowBudget}
                    >
                      {entry.orgPointsUsed} / {entry.orgPointsBudget}
                    </span>
                  {:else}
                    <span class="budget typo-text-small">&mdash;</span>
                  {/if}
                </div>
                <Button size="small" href={`/wave/orgs/${entry.org.id}`}>View org</Button>
              </div>
            {/snippet}
          </OrgPreviewCard>
        {/each}
      </div>
    {/if}
  </Section>

  <div style:margin-top="2rem">
    <Section
      header={{
        label: 'Repo Applications',
        icon: Ledger,
        actions: [
          {
            label: 'Apply repo',
            icon: Plus,
            variant: 'primary',
            disabled: false,
            href: `/wave/maintainer-onboarding/review-repos`,
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
      <div class="filter-row">
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
                    >Each approved repo can use up to the program's per-repo points budget per Wave. <a
                      href="https://docs.drips.network/wave/maintainers/points-budgets"
                      target="_blank"
                      rel="noopener noreferrer"
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
    width: 9rem;
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
    color: var(--color-foreground);
  }

  .budget.over-budget {
    color: var(--color-negative-level-6);
  }

  .budget.low-budget {
    color: var(--color-caution-level-6);
  }

  .status {
    width: 9rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    text-align: right;
    white-space: nowrap;
  }

  .orgs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
    isolation: isolate;
  }

  .org-card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }

  .org-card-budget {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .org-card-budget .budget {
    width: auto;
    text-align: left;
  }

  .org-card-budget-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>

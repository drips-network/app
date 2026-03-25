<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Speedometer from '$lib/components/icons/Speedometer.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import Section from '$lib/components/section/section.svelte';
  import StatusBadge from '$lib/components/status-badge/status-badge.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Button from '$lib/components/button/button.svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { withdrawIssueApplication } from '$lib/utils/wave/issues';
  import { renderIssueTitle } from '$lib/utils/wave/issues';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import formatDate from '$lib/utils/format-date';

  let { data } = $props();
  let { wavePrograms, selectedWaveProgramId, quotaDetails } = $derived(data);

  let dropdownValue = $state(selectedWaveProgramId);

  let dropdownOptions = $derived(
    wavePrograms.map((wp) => ({
      value: wp.id,
      title: `${wp.name} Wave`,
    })),
  );

  function handleWaveProgramChange(value: string) {
    goto(`/wave/contributors/limit-details?waveProgramId=${value}`, {
      keepFocus: true,
    });
  }

  const byMostRecent = (a: { appliedAt: Date }, b: { appliedAt: Date }) =>
    b.appliedAt.getTime() - a.appliedAt.getTime();

  let countingApplications = $derived(
    (quotaDetails?.applications.filter((a) => a.countsTowardQuota) ?? []).toSorted(byMostRecent),
  );

  let exemptApplications = $derived(
    (quotaDetails?.applications.filter((a) => !a.countsTowardQuota) ?? []).toSorted(byMostRecent),
  );

  async function handleWithdraw(app: (typeof countingApplications)[number]) {
    if (!selectedWaveProgramId) return;

    const message =
      app.status === 'accepted'
        ? 'Are you sure you want to withdraw this application? You will be unassigned from this issue.'
        : 'Are you sure you want to withdraw this application?';

    await doWithConfirmationModal(message, () =>
      doWithErrorModal(async () => {
        await withdrawIssueApplication(undefined, selectedWaveProgramId, app.issue.id, app.id);
        await invalidateAll();
      }),
    );
  }
</script>

{#snippet applicationRow(
  app: (typeof countingApplications)[number],
  actions?: import('svelte').Snippet,
)}
  <div class="application-row">
    <a class="application-info" href="/wave/contributors/issues/{app.issue.id}">
      <div class="issue-header">
        <span class="repo"
          ><RepoBadge
            size="tiny"
            repo={app.issue.repo}
            avatarUrl={app.issue.repo.gitHubOrgAvatarUrl ?? undefined}
          /></span
        >
        <StatusBadge size="tiny" color={app.status === 'accepted' ? 'positive' : 'caution'}>
          {app.status === 'accepted' ? 'Assigned to you' : 'Applied by you'}
        </StatusBadge>
      </div>
      <span class="issue-title typo-text-bold"
        ><span class="issue-number">#{app.issue.gitHubIssueNumber}</span>
        {@html renderIssueTitle(app.issue.title)}</span
      >
      <span class="applied-at typo-text-small">Applied {formatDate(app.appliedAt)}</span>
    </a>
    {#if actions}
      <div class="application-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
{/snippet}

<HeadMeta title="Application Limits | Wave" />

<div class="limit-details">
  <div class="page-header">
    <Breadcrumbs
      crumbs={[
        { label: 'Contributor Dashboard', href: '/wave/contributors/issues' },
        { label: 'Application Limits' },
      ]}
    />
    <div class="header-row">
      {#snippet headerInfoTooltip()}
        You can have up to a certain number of active applications per Wave Program at a time.
        Pending applications and accepted assignments both count toward this limit. Withdraw
        applications you no longer need to free up slots.
        <a
          class="typo-link"
          href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#application-limits"
          target="_blank"
          rel="noopener noreferrer">Learn more</a
        >
      {/snippet}
      <SectionHeader
        icon={Speedometer}
        label="Application Limits"
        infoTooltipContent={headerInfoTooltip}
      />
      <div class="wave-program-picker">
        <Dropdown
          small
          options={dropdownOptions}
          bind:value={dropdownValue}
          onchange={handleWaveProgramChange}
        />
      </div>
    </div>
  </div>

  {#if quotaDetails}
    <div class="quota-summary" class:at-limit={quotaDetails.used > quotaDetails.limit}>
      <div class="quota-bar-track">
        <div
          class="quota-bar-fill"
          class:full={quotaDetails.used > quotaDetails.limit}
          style:width="{Math.min(100, (quotaDetails.used / quotaDetails.limit) * 100)}%"
        ></div>
      </div>
      <div class="quota-labels">
        <span class="quota-used typo-text-bold">
          {quotaDetails.used} / {quotaDetails.limit} slots used
          {#if quotaDetails.used > quotaDetails.limit}
            <Tooltip>
              <InfoCircle style="height: 1.25rem; width: 1.25rem;" />
              {#snippet tooltip_content()}
                Your usage can temporarily exceed the limit if an issue you previously applied to
                was assigned to someone else (removing it from your count) but later unassigned,
                causing your application to count again.
              {/snippet}
            </Tooltip>
          {/if}
        </span>
        <span class="quota-remaining typo-text-small">
          {#if quotaDetails.remaining === 0}
            Limit reached
          {:else}
            {quotaDetails.remaining} remaining
          {/if}
        </span>
      </div>
    </div>

    <Section
      header={{
        label: 'Counting toward limit',
        count: countingApplications.length,
      }}
      skeleton={{
        loaded: true,
        empty: countingApplications.length === 0,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No applications yet',
        emptyStateText: 'Applications that count against your limit will appear here.',
      }}
    >
      <div class="applications-list">
        {#each countingApplications as app (app.id)}
          {#snippet withdrawButton()}
            <Button variant="destructive-outline" size="small" onclick={() => handleWithdraw(app)}>
              Withdraw
            </Button>
          {/snippet}
          {@render applicationRow(app, withdrawButton)}
        {/each}
      </div>
    </Section>

    {#snippet exemptInfoTooltip()}
      These applications would normally count toward your limit, but have been exempted. We
      automatically review submitted PRs for substance and occasionally exempt issues from the limit
      after a substantial PR has been submitted.
      <a
        class="typo-link"
        href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#application-limits"
        target="_blank"
        rel="noopener noreferrer">Learn more</a
      >
    {/snippet}

    <Section
      header={{
        label: 'Exempt from limit',
        count: exemptApplications.length,
        infoTooltipContent: exemptInfoTooltip,
      }}
      skeleton={{
        loaded: true,
        empty: exemptApplications.length === 0,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No exempt applications',
        emptyStateText: 'No applications have been exempted from your limit.',
      }}
    >
      <div class="applications-list">
        {#each exemptApplications as app (app.id)}
          {@render applicationRow(app)}
        {/each}
      </div>
    </Section>
  {:else}
    <p class="typo-text">No wave programs available.</p>
  {/if}
</div>

<style>
  .limit-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .wave-program-picker {
    flex-shrink: 0;
  }

  .quota-summary {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    background-color: var(--color-primary-level-1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .quota-summary.at-limit {
    background-color: var(--color-negative-level-1);
    border-color: var(--color-negative-level-2);
  }

  .quota-bar-track {
    height: 0.5rem;
    border-radius: 0.25rem 0 0.25rem 0.25rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
  }

  .quota-bar-fill {
    height: 100%;
    border-radius: 0.25rem 0 0.25rem 0.25rem;
    background-color: var(--color-primary-level-6);
    transition: width 0.4s ease;
  }

  .quota-bar-fill.full {
    background-color: var(--color-negative);
  }

  .quota-labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .quota-used {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .quota-remaining {
    color: var(--color-foreground-level-5);
  }

  .at-limit .quota-remaining {
    color: var(--color-negative);
    font-weight: bold;
  }

  .applications-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .application-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
    transition: background-color 0.2s;
  }

  .application-row:last-child {
    border-bottom: none;
  }

  .application-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
    text-decoration: none;
    color: inherit;
  }

  .application-row:hover {
    background-color: var(--color-foreground-level-1);
  }

  .issue-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .repo {
    display: flex;
    align-items: center;
    color: var(--color-foreground-level-5);
    overflow: hidden;
    flex-shrink: 1;
    min-width: 0;
  }

  .issue-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue-number {
    color: var(--color-foreground-level-5);
    font-weight: normal;
  }

  .applied-at {
    color: var(--color-foreground-level-5);
  }

  .application-actions {
    flex-shrink: 0;
  }
</style>

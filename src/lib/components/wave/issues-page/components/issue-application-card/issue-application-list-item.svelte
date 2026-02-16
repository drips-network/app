<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import modal from '$lib/stores/modal';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import type { UserCodeMetricsDto } from '$lib/utils/wave/types/user';
  import {
    handleAssignApplicant,
    handleUnassignContributor,
    handleWithdrawApplication,
  } from './application-actions';
  import ApplicationModal from './application-modal.svelte';
  import BinBadge from './bin-badge.svelte';
  import { KEY_METRICS } from './metrics';

  let {
    application,
    isMaintainer,
    issue,
    user,
    activeWaveExists,
    codeMetricsPromise,
  }: {
    application: IssueApplicationWithDetailsDto;
    isMaintainer: boolean;
    issue: IssueDetailsDto;
    user: WaveLoggedInUser | null;
    activeWaveExists: boolean;
    codeMetricsPromise: Promise<UserCodeMetricsDto | null>;
  } = $props();

  const isOwnApplication = $derived(user ? application.applicant.id === user.id : false);
  const isAcceptedApplication = $derived(application.status === 'accepted');

  const disabled = $derived(
    application.status === 'rejected' || application.status === 'withdrawn',
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="list-row"
  class:highlighted={isOwnApplication || isAcceptedApplication}
  class:disabled
  onclick={() =>
    modal.show(ApplicationModal, undefined, {
      codeMetricsPromise,
      ...application,
    })}
>
  <div class="cell user-cell">
    <GithubUserBadge
      user={application.applicant}
      link={false}
      verifiedBadge={application.applicant.verified}
    />
  </div>

  <div class="cell application-text-cell typo-text-small">
    <span class="application-text-truncated">{application.applicationText}</span>
  </div>

  <div class="cell metric-cell typo-text-small-bold">
    {application.applicant.currentWaveAssignmentCount ?? '—'}
  </div>

  <div class="cell metric-cell typo-text-small-bold">
    {application.applicant.currentWavePointsEarned ?? '—'}
  </div>

  {#each KEY_METRICS as { key } (key)}
    <div class="cell metric-cell">
      <BinBadge {codeMetricsPromise} {key} showUnknown />
    </div>
  {/each}

  <div class="cell actions-cell" onclick={(e) => e.stopPropagation()}>
    {#if isMaintainer}
      {#if application.status === 'pending' || application.status === 'unassigned'}
        <Tooltip disabled={activeWaveExists}>
          <Button
            size="small"
            variant="primary"
            icon={Check}
            onclick={() => handleAssignApplicant(issue, application)}
            disabled={!activeWaveExists}>Accept</Button
          >
          {#snippet tooltip_content()}
            Assignment is only available during an active Wave.
          {/snippet}
        </Tooltip>
      {/if}
      {#if application.status === 'accepted'}
        <Button
          size="small"
          icon={Cross}
          variant="destructive"
          onclick={() => handleUnassignContributor(issue, application)}>Unassign</Button
        >
      {/if}
    {:else if isOwnApplication}
      {#if application.status === 'pending' || application.status === 'accepted'}
        <Button
          size="small"
          icon={Cross}
          onclick={() => handleWithdrawApplication(issue, application)}>Withdraw</Button
        >
      {/if}
    {/if}

    {#if application.status === 'accepted'}
      <span class="status-badge typo-text-small-bold">Assigned</span>
    {/if}

    {#if application.status === 'withdrawn'}
      <span class="status-badge disabled-text typo-text-small-bold">Withdrawn</span>
    {/if}

    {#if application.status === 'rejected'}
      <span class="status-badge disabled-text typo-text-small-bold">Rejected</span>
    {/if}

    {#if application.status === 'unassigned'}
      <span class="status-badge disabled-text typo-text-small-bold">Previously unassigned</span>
    {/if}
  </div>
</div>

<style>
  .list-row {
    display: grid;
    grid-template-columns: var(--applications-table-columns);
    align-items: center;
    border-bottom: 1px solid var(--color-foreground-level-3);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .list-row:hover {
    background-color: var(--color-foreground-level-1);
  }

  .list-row.highlighted:hover {
    background-color: var(--color-primary-level-2);
  }

  .list-row.highlighted {
    background-color: var(--color-primary-level-1);
  }

  .list-row.disabled {
    opacity: 0.6;
  }

  .cell {
    padding: 0.75rem 0.5rem;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .user-cell {
    padding-left: 0.75rem;
    overflow: hidden;
    max-width: 100%;
  }

  .user-cell :global(.github-user-badge) {
    min-width: 0;
  }

  .user-cell :global(.github-user-badge .name) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .application-text-cell {
    color: var(--color-foreground-level-6);
  }

  .application-text-truncated {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions-cell {
    gap: 0.5rem;
    padding-right: 0.75rem;
  }

  .status-badge {
    white-space: nowrap;
  }

  .disabled-text {
    color: var(--color-foreground-level-5);
  }
</style>

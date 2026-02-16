<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
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

<Card
  style="background-color: {isOwnApplication || isAcceptedApplication
    ? 'var(--color-primary-level-1)'
    : 'var(--color-background)'};

    opacity: {disabled ? 0.6 : 1};
    "
>
  <div
    class="issue-application-card"
    class:is-highlighted={isOwnApplication || isAcceptedApplication}
  >
    <GithubUserBadge
      user={application.applicant}
      link={false}
      verifiedBadge={application.applicant.verified}
    />
    <p class="application-text">
      <Markdown content={application.applicationText} lineClamp={2} />
    </p>

    <Divider />

    <div class="metrics">
      {#if application.applicant.currentWaveAssignmentCount != null}
        <div class="metric">
          <div class="label typo-text-small" style:color="var(--color-foreground-level-6)">
            Current assignments
          </div>
          <div class="value typo-text-small-bold">
            {application.applicant.currentWaveAssignmentCount}
          </div>
        </div>
      {/if}
      {#if application.applicant.currentWavePointsEarned != null}
        <div class="metric">
          <div class="label typo-text-small" style:color="var(--color-foreground-level-6)">
            Points earned this Wave
          </div>
          <div class="value typo-text-small-bold">
            {application.applicant.currentWavePointsEarned}
          </div>
        </div>
      {/if}
      {#each KEY_METRICS as { key, label } (key)}
        <div class="metric">
          <div class="label typo-text-small" style:color="var(--color-foreground-level-6)">
            {label}
          </div>
          <div class="value">
            <BinBadge {codeMetricsPromise} {key} showUnknown />
          </div>
        </div>
      {/each}
    </div>

    <Divider />

    <div class="actions">
      <Button
        onclick={() =>
          modal.show(ApplicationModal, undefined, {
            codeMetricsPromise,
            ...application,
          })}>View details</Button
      >
      {#if isMaintainer}
        {#if application.status === 'pending' || application.status === 'unassigned'}
          {@const orgQuotaExhausted = application.applicant.currentWaveSameOrgQuotaRemaining === 0}
          {@const assignDisabled = !activeWaveExists || orgQuotaExhausted}
          <div style:width="100%;">
            <Tooltip disabled={!assignDisabled}>
              <div style:display="flex" style:flex-direction="column" style:width="100%">
                <Button
                  variant="primary"
                  icon={Check}
                  onclick={() => handleAssignApplicant(issue, application)}
                  disabled={assignDisabled}>Accept & assign</Button
                >
              </div>
              {#snippet tooltip_content()}
                {#if orgQuotaExhausted}
                  This contributor has reached the maximum number of assignments from this
                  organization in the current Wave.
                {:else}
                  Assignment is only available during an active Wave.
                {/if}
              {/snippet}
            </Tooltip>
          </div>
        {/if}
        {#if application.status === 'rejected'}
          <Button icon={Cross} disabled>Application rejected</Button>
        {/if}
        {#if application.status === 'accepted'}
          <Button
            icon={Cross}
            variant="destructive"
            onclick={() => handleUnassignContributor(issue, application)}
            >Unassign contributor</Button
          >
        {/if}
      {:else if isOwnApplication}
        {#if application.status === 'pending' || application.status === 'accepted'}
          <Button icon={Cross} onclick={() => handleWithdrawApplication(issue, application)}
            >Withdraw</Button
          >
        {/if}
      {/if}

      {#if application.status === 'accepted'}
        <Button icon={Check} disabled>Applicant assigned</Button>
      {/if}

      {#if application.status === 'withdrawn'}
        <span class="disabled-text typo-text-small-bold"> Applicant withdrew </span>
      {/if}

      {#if application.status === 'unassigned'}
        <span class="disabled-text typo-text-small-bold"
          >Applicant previously unassigned by repo maintainers</span
        >
      {/if}
    </div>
  </div>
</Card>

<style>
  .issue-application-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  .application-text {
    max-height: 4rem;
    overflow: hidden;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .disabled-text {
    color: var(--color-foreground-level-5);
  }

  .metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>

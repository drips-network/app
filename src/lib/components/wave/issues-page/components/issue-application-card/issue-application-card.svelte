<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import {
    acceptIssueApplication,
    getIssue,
    unassignContributorFromIssue,
    withdrawIssueApplication,
  } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import { getUserCodeMetrics } from '$lib/utils/wave/users';
  import { notifyIssuesUpdated } from '../../issue-update-coordinator';
  import ApplicationModal from './application-modal.svelte';
  import BinBadge from './bin-badge.svelte';
  import { KEY_METRICS } from './metrics';

  let {
    application,
    isMaintainer,
    issue,
    user,
  }: {
    application: IssueApplicationWithDetailsDto;
    isMaintainer: boolean;
    issue: IssueDetailsDto;
    user: WaveLoggedInUser | null;
  } = $props();

  async function handleAssignApplicant() {
    await doWithConfirmationModal(
      `
        Are you sure you want to assign ${application.applicant.gitHubUsername} to work on this issue?
        They will be assigned to the issue on GitHub, and notified that they can begin working on the issue immediately.
      `,
      () =>
        doWithErrorModal(async () => {
          if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

          try {
            await acceptIssueApplication(undefined, issue.waveProgramId, issue.id, application.id);
          } finally {
            await invalidate('wave:issues');

            const newIssueDetails = await getIssue(undefined, issue.id);
            if (newIssueDetails) notifyIssuesUpdated([newIssueDetails]);
          }
        }),
    );
  }

  async function handleWithdrawApplication() {
    await doWithConfirmationModal(
      `
        Are you sure you want to withdraw your application for this issue?
        ${
          application.status === 'accepted'
            ? 'You will be unassigned from the issue on GitHub, and the maintainer will need to assign a new contributor.'
            : ''
        }
      `,
      () =>
        doWithErrorModal(async () => {
          if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

          try {
            await withdrawIssueApplication(
              undefined,
              issue.waveProgramId,
              issue.id,
              application.id,
            );
          } finally {
            await invalidate('wave:issues');

            const newIssueDetails = await getIssue(undefined, issue.id);
            if (newIssueDetails) notifyIssuesUpdated([newIssueDetails]);
          }
        }),
    );
  }

  async function handleUnassign() {
    await doWithConfirmationModal(
      `
        Are you sure you want to unassign this contributor from the issue?
        They'll be notified to stop working on it immediately, and will not receive any Points.
      `,
      () =>
        doWithErrorModal(async () => {
          if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

          try {
            await unassignContributorFromIssue(
              undefined,
              issue.waveProgramId,
              issue.id,
              application.id,
            );
          } finally {
            await invalidate('wave:issues');

            const newIssueDetails = await getIssue(undefined, issue.id);
            if (newIssueDetails) notifyIssuesUpdated([newIssueDetails]);
          }
        }),
    );
  }

  const isOwnApplication = $derived(user ? application.applicant.id === user.id : false);

  const disabled = $derived(
    application.status === 'rejected' ||
      application.status === 'withdrawn' ||
      application.status === 'unassigned',
  );

  const codeMetricsPromise = getUserCodeMetrics(undefined, application.applicant.id);
</script>

<Card
  style="background-color: {isOwnApplication
    ? 'var(--color-primary-level-1)'
    : 'var(--color-background)'};
    
    opacity: {disabled ? 0.6 : 1};
    "
>
  <div class="issue-application-card" class:is-own={isOwnApplication}>
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
        {#if application.status === 'pending'}
          <Button variant="primary" icon={Check} onclick={handleAssignApplicant}
            >Accept & assign</Button
          >
        {/if}
        {#if application.status === 'rejected'}
          <Button icon={Cross} disabled>Application rejected</Button>
        {/if}
        {#if application.status === 'accepted'}
          <Button icon={Cross} variant="destructive" onclick={handleUnassign}
            >Unassign contributor</Button
          >
        {/if}
      {:else if isOwnApplication}
        {#if application.status === 'pending' || application.status === 'accepted'}
          <Button icon={Cross} onclick={handleWithdrawApplication}>Withdraw</Button>
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
          >Applicant unassigned by repo maintainers</span
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

<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Minus from '$lib/components/icons/Minus.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Sharrow from '$lib/components/icons/Sharrow.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import shareSteps from '$lib/flows/share/share-steps';
  import addIssuesToWaveFlow from '$lib/flows/wave/add-issues-to-wave-program/add-issues-to-wave-program-flow';
  import modal from '$lib/stores/modal';
  import { BASE_URL } from '$lib/utils/base-url';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import {
    getIssue,
    getIssueApplications,
    markIssueAsCompleted,
    renderIssueTitle,
  } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import {
    beComplexityToFriendlyLabel,
    removeIssueFromWaveProgram,
  } from '$lib/utils/wave/wavePrograms';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import WaveBadge from '../wave-program-badge/wave-program-badge.svelte';
  import IssueApplicationCard from './components/issue-application-card/issue-application-card.svelte';
  import UpdateComplexityModal from './components/update-complexity-modal.svelte';
  import { notifyIssuesUpdated } from './issue-update-coordinator';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { COMPLIMENT_TYPES, type IssueComplimentDto } from '$lib/utils/wave/types/compliment';
  import Heart from '$lib/components/icons/Heart.svelte';
  import formatDate from '$lib/utils/format-date';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import type {
    WaveProgramDto,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    issue: IssueDetailsDto;
    allowAddingOrRemovingWave?: boolean;

    /** User's wave repos - used to determine which waves the issue may be added to */
    waveProgramRepos?: WaveProgramRepoWithDetailsDto[];

    /** Wave the issue is part of, if any */
    partOfWaveProgram: WaveProgramDto | null;

    /** For listing available wave programs to add the issue to */
    wavePrograms: WaveProgramDto[];

    /** Applications for the issue in the wave it's currently in. Not awaited, displayed async */
    applicationsPromise: ReturnType<typeof getIssueApplications> | null;

    /** Configuration for button link back to issues list on mobile  */
    backToConfig: { label: string; href: string };

    user: WaveLoggedInUser | null;
    headMetaTitle: string;
    givenCompliments: IssueComplimentDto[];
  }

  let {
    issue,
    allowAddingOrRemovingWave,
    waveProgramRepos = [],
    partOfWaveProgram,
    wavePrograms,
    applicationsPromise: issueApplicationsPromise,
    user,
    backToConfig,
    headMetaTitle,
    givenCompliments,
  }: Props = $props();

  let matchingWaveProgramRepos = $derived(
    waveProgramRepos.filter(
      (waveProgramRepo) =>
        waveProgramRepo.repo.id === issue.repo.id && waveProgramRepo.status === 'approved',
    ),
  );

  let isMaintainer = $derived(matchingWaveProgramRepos.length > 0);
  let canBeAddedToAWave = $derived(isMaintainer && issue.state === 'open');
  let canUpdateComplexity = $derived(
    Boolean(
      partOfWaveProgram && allowAddingOrRemovingWave && isMaintainer && issue.state === 'open',
    ),
  );

  async function handleRemoveFromWave() {
    if (!partOfWaveProgram) {
      return;
    }

    await doWithConfirmationModal(
      // todo(wave): when someone is assigned, make this message more scary
      `Are you sure you want to remove this issue from the ${partOfWaveProgram.name} Wave Program?`,
      () =>
        doWithErrorModal(async () =>
          removeIssueFromWaveProgram(undefined, partOfWaveProgram?.id, issue.id),
        ),
    );

    await invalidate('wave:issues');

    const newIssue = await getIssue(undefined, issue.id);
    if (newIssue) notifyIssuesUpdated([newIssue]);
  }

  let applications = $state<IssueApplicationWithDetailsDto[] | null>(null);
  let promisePending = $state(true);
  $effect(() => {
    promisePending = true;
    issueApplicationsPromise?.then((apps) => {
      applications = apps.data
        // own application, if any, first
        .sort((a, b) => {
          const ownUserId = user?.id || '';
          if (a.applicant.id === ownUserId && b.applicant.id !== ownUserId) {
            return -1;
          } else if (a.applicant.id !== ownUserId && b.applicant.id === ownUserId) {
            return 1;
          } else {
            return 0;
          }
        });

      promisePending = false;
    });
  });

  let canApplyToIssue = $derived(
    partOfWaveProgram !== null &&
      // Don't allow applying to own issue
      !allowAddingOrRemovingWave,
  );

  async function handleMarkIssueCompleted() {
    await doWithConfirmationModal(
      'Are you sure you want to mark this issue as completed? This will close the issue on GitHub and award points to the assigned applicant.',
      () =>
        doWithErrorModal(async () => {
          await markIssueAsCompleted(undefined, issue.id);
        }),
    );
  }

  function handleIssueUpdated(updatedIssue: IssueDetailsDto) {
    issue = updatedIssue;
  }

  function openUpdateComplexityModal() {
    if (!partOfWaveProgram) return;

    modal.show(UpdateComplexityModal, undefined, {
      issue,
      waveProgram: partOfWaveProgram,
      onIssueUpdated: handleIssueUpdated,
    });
  }

  function openWaveProgramModal() {
    modal.show(
      Stepper,
      undefined,
      addIssuesToWaveFlow(waveProgramRepos, [issue], wavePrograms),
    );
  }
</script>

<div class="back-to-issues-link">
  <Button href={backToConfig.href} icon={ArrowLeft} size="small">
    {backToConfig.label}
  </Button>
</div>

<HeadMeta title={headMetaTitle} />

<div
  class="wrapper"
  style:view-transition-name={`issue-${issue.id}`}
  style:view-transition-class="element-handover"
>
  <div class="issue">
    <Card>
      <div class="details-and-description">
        <div class="details">
          <div class="left">
            <h1 class="typo-header-2 line-clamp-3">
              <span style:color="var(--color-foreground-level-5)">#{issue.gitHubIssueNumber}</span>
              {@html renderIssueTitle(issue.title)}
            </h1>

            <RepoBadge repo={issue.repo} />
          </div>
        </div>

        {#if issue.body}
          <ExpandableText>
            <Markdown content={issue.body} />
          </ExpandableText>
        {:else}
          <p style:color="var(--color-foreground-level-4)">No description provided.</p>
        {/if}
      </div>
    </Card>

    {#if issueApplicationsPromise && issue.state === 'open'}
      <Section
        header={{
          label: 'Applications',
          icon: Ledger,
          actions: [
            {
              label: 'Apply to work on this issue',
              icon: Ledger,
              variant: 'primary',
              disabled: !canApplyToIssue,
              href: `/wave/${partOfWaveProgram?.slug}/issues/${issue.id}/apply`,
            },
          ],
          infoTooltip: 'Contributors can start applying to work on this issue during active Waves.',
        }}
        skeleton={{
          loaded: !promisePending,
          empty: applications?.length === 0,
          emptyStateEmoji: '🫙',
          emptyStateHeadline: 'No applications yet',
          emptyStateText: 'No one has applied to work on this issue in the Wave yet.',
        }}
      >
        <div class="applications-grid">
          {#each applications?.slice(0, 5) as application (application.id)}
            <IssueApplicationCard {user} {issue} {isMaintainer} {application} />
          {/each}
        </div>
      </Section>
    {/if}
  </div>

  <div class="sidebar">
    <Card class="sidebar-card" style="border-radius: 2rem 0 2rem 2rem;">
      {#if issue.waveProgramId}
        <div class="metrics-row">
          <div class="metric-box">
            <h5>Points</h5>
            <div class="metric-value metric-value-points">
              {issue.points ?? '—'}
            </div>
          </div>

          <div class="metric-box">
            <div class="metric-header">
              <h5>Complexity</h5>
              {#if canUpdateComplexity}
                <button
                  class="edit-icon-button"
                  onclick={openUpdateComplexityModal}
                  aria-label="Edit complexity"
                >
                  <Pen style="fill: var(--color-foreground-level-6);" />
                </button>
              {/if}
            </div>
            <div class="metric-value">
              {#if issue.complexity}
                {beComplexityToFriendlyLabel(issue.complexity)}
              {:else}
                <span style:color="var(--color-foreground-level-5)">Not set</span>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <div class="sidebar-actions">
        {#if issue.assignedApplicant && issue.state === 'open' && isMaintainer}
          <Button icon={Check} variant="primary" size="large" onclick={handleMarkIssueCompleted}>
            Mark as complete
          </Button>
        {/if}

        {#if issue.waveProgramId && !issue.assignedApplicant}
          <Button
            icon={Sharrow}
            variant="primary"
            size="large"
            onclick={() =>
              modal.show(
                Stepper,
                undefined,
                shareSteps({
                  url: `${BASE_URL}/wave/${partOfWaveProgram?.slug}/issues/${issue.id}/apply`,
                  shareModalText: 'Share a link for applicants to apply for this issue.',
                }),
              )}
          >
            Share link to apply
          </Button>
        {/if}

        <Button
          icon={ArrowBoxUpRight}
          href={`https://github.com/${issue.repo.gitHubRepoFullName}/issues/${issue.gitHubIssueNumber}`}
        >
          View on GitHub
        </Button>
      </div>

      <div class="sidebar-section no-divider">
        <h5>Assignee</h5>

        {#if issue.assignedApplicant}
          <GithubUserBadge user={issue.assignedApplicant} />
        {:else}
          <p style:color="var(--color-foreground-level-5)">No assignee yet.</p>
        {/if}
      </div>

      <div class="sidebar-section">
        <div class="section-headline-with-info">
          <h5>Due</h5>
          <Tooltip>
            <InfoCircle style="height: 1.25rem;" />

            {#snippet tooltip_content()}
              Issues assigned as part of a Wave are due on the end date of that Wave. If the issue
              is resolved after this date, the applicant may not receive points for completing it.
            {/snippet}
          </Tooltip>
        </div>

        {#if issue.assignedApplicant}
          <p>{formatDate(issue.assignedApplicant.dueDate)}</p>
        {:else}
          <p style:color="var(--color-foreground-level-5)">Not set</p>
        {/if}
      </div>

      {#if issue.points && givenCompliments.length > 0}
        <div class="sidebar-section">
          <h5>Compliments</h5>
          <ul class="compliments-list">
            {#each givenCompliments as compliment (compliment.complimentType)}
              <li class="compliment-list-item">
                <span class="typo-text compliment-label">
                  {COMPLIMENT_TYPES[compliment.complimentType].label}
                </span>

                <span class="typo-text">
                  +{compliment.points}
                </span>
              </li>
            {/each}
          </ul>

          {#if isMaintainer && issue.state === 'closed' && issue.assignedApplicant && partOfWaveProgram}
            <div class="sidebar-actions">
              <Button
                target=""
                icon={Heart}
                href="/wave/{partOfWaveProgram.slug}/issues/{issue.id}/compliments"
              >
                Make compliment
              </Button>
            </div>
          {/if}
        </div>
      {/if}

      <div class="sidebar-section">
        <h5>Details</h5>
        <p style:color="var(--color-foreground-level-5)">todo(wave): display some deets</p>
      </div>

      <div class="sidebar-section">
        <div class="metric-header">
          <h5>Wave</h5>
          {#if allowAddingOrRemovingWave}
            <button
              class="edit-icon-button"
              onclick={openWaveProgramModal}
              aria-label="Edit wave"
              disabled={!canBeAddedToAWave && !partOfWaveProgram}
            >
              <Pen style="fill: var(--color-foreground-level-6);" />
            </button>
          {/if}
        </div>

        {#if partOfWaveProgram}
          <WaveBadge waveProgram={partOfWaveProgram} />
        {:else}
          <p style:color="var(--color-foreground-level-5)">
            Issue isn't part of a Wave Program yet.
          </p>
        {/if}

        {#if allowAddingOrRemovingWave}
          {#if partOfWaveProgram}
            <Button icon={Minus} onclick={handleRemoveFromWave}>Remove from Wave Program</Button>
          {:else}
            <Button
              icon={Plus}
              variant="primary"
              disabled={!canBeAddedToAWave}
              onclick={openWaveProgramModal}
            >
              Add to Wave Program
            </Button>
          {/if}
        {/if}
      </div>
    </Card>
  </div>
</div>

<style>
  .wrapper {
    height: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 18rem;
  }

  .sidebar {
    position: sticky;
    top: 7.5rem;
    height: fit-content;
    max-height: calc(100vh - 8.5rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-card {
    height: fit-content;
    padding: 1rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .metric-box {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.75rem;
    height: 80px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: var(--color-foreground-level-1);
  }

  .metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .metric-value {
    font-size: 1.25rem;
    color: var(--color-foreground);
  }

  .metric-value-points {
    font-size: 2rem;
    line-height: 1.2;
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .sidebar-actions :global(.button) {
    width: 100%;
  }

  .edit-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 999px;
    border: 1px solid var(--color-foreground-level-3);
    background-color: var(--color-background);
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .edit-icon-button:hover {
    background-color: var(--color-foreground-level-1);
    border-color: var(--color-foreground-level-4);
  }

  .edit-icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 1rem;
  }

  .sidebar-section:last-of-type {
    padding-bottom: 0;
  }

  .section-headline-with-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sidebar-section:not(:first-child) {
    border-top: 1px solid var(--color-foreground-level-3);
    padding-top: 1rem;
  }

  .sidebar-section.no-divider {
    border-top: none;
    padding-top: 0;
  }

  .compliment-label {
    min-width: 0;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compliments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .compliment-list-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    align-items: space-between;
  }

  .issue {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-width: 0;
    height: 100%;
    justify-content: space-between;
  }

  .details-and-description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    overflow-wrap: break-word;
  }

  h5 {
    color: var(--color-foreground-level-5);
  }

  .details .left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .details .left {
    flex-shrink: 1;
    min-width: 0;
  }

  .details {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .applications-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  }

  .back-to-issues-link {
    margin-bottom: 1rem;
    display: none;
  }

  @media (max-width: 1400px) {
    .wrapper {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .sidebar {
      max-height: none;
    }
  }

  @media (max-width: 1024px) {
    .back-to-issues-link {
      display: block;
    }
  }
</style>

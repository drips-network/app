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
  import Settings from '$lib/components/icons/Settings.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
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
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import WaveBadge from '../wave-program-badge/wave-program-badge.svelte';
  import IssueApplicationCard from './components/issue-application-card/issue-application-card.svelte';
  import UpdateComplexityModal from './components/update-complexity-modal.svelte';
  import ModeratorUpdateComplexityModal from './components/moderator-update-complexity-modal.svelte';
  import ModeratorRemoveFromWaveModal from './components/moderator-remove-from-wave-modal.svelte';
  import SidebarButton from './components/sidebar-button/sidebar-button.svelte';
  import { notifyIssuesUpdated } from './issue-update-coordinator';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { COMPLIMENT_TYPES, type IssueComplimentDto } from '$lib/utils/wave/types/compliment';
  import Heart from '$lib/components/icons/Heart.svelte';
  import Multiplier from '$lib/components/icons/Multiplier.svelte';
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

    /** Whether viewing in the context of a wave program (e.g. /wave/[slug]/issues/[id]).
     * Used to determine if moderation actions should be shown. */
    isInWaveContext?: boolean;
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
    isInWaveContext = false,
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

  // Moderation permissions
  let canModerateWaveIssues = $derived(user?.permissions?.includes('moderateWaveIssues') ?? false);
  let showModerationSection = $derived(
    canModerateWaveIssues && isInWaveContext && partOfWaveProgram !== null,
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
          await invalidate('wave:issues');
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

  // Moderation modal handlers
  function openModeratorUpdateComplexityModal() {
    if (!partOfWaveProgram) return;

    modal.show(ModeratorUpdateComplexityModal, undefined, {
      issue,
      waveProgram: partOfWaveProgram,
      onIssueUpdated: handleIssueUpdated,
    });
  }

  function openModeratorRemoveFromWaveModal() {
    if (!partOfWaveProgram) return;

    modal.show(ModeratorRemoveFromWaveModal, undefined, {
      issue,
      waveProgram: partOfWaveProgram,
    });
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

            <RepoBadge
              repo={issue.repo}
              avatarUrl={issue.repo.org.gitHubOrgAvatarUrl ?? undefined}
            />
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
          {#each applications as application (application.id)}
            <IssueApplicationCard {user} {issue} {isMaintainer} {application} />
          {/each}
        </div>
      </Section>
    {/if}
  </div>

  <div class="sidebar">
    <Card style="height: fit-content; padding: 0; overflow: auto;">
      {#if issue.assignedApplicant && issue.state === 'open' && isMaintainer}
        <div>
          <SidebarButton icon={Check} variant="primary" onclick={handleMarkIssueCompleted}>
            Mark completed
          </SidebarButton>
        </div>
      {/if}

      {#if issue.waveProgramId && !issue.assignedApplicant}
        <div>
          <SidebarButton
            icon={Sharrow}
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
            Share apply link
          </SidebarButton>
        </div>
      {/if}

      <SidebarButton
        icon={ArrowBoxUpRight}
        href={`https://github.com/${issue.repo.gitHubRepoFullName}/issues/${issue.gitHubIssueNumber}`}
      >
        View on GitHub
      </SidebarButton>

      <div class="sidebar-section">
        <div class="content">
          <h5>Assigned applicant</h5>

          {#if issue.assignedApplicant}
            <GithubUserBadge user={issue.assignedApplicant} />

            <div class="section-headline-with-info" style:margin-top="1rem">
              <h5>Due date</h5>

              <Tooltip>
                <InfoCircle style="height: 1.25rem;" />

                {#snippet tooltip_content()}
                  Issues assigned as part of a Wave are due on the end date of that Wave. If the
                  issue is resolved after this date, the applicant may not receive points for
                  completing it.
                {/snippet}
              </Tooltip>
            </div>

            <p>{formatDate(issue.assignedApplicant.dueDate)}</p>
          {:else}
            <p style:color="var(--color-foreground-level-5)">No applicant assigned.</p>
          {/if}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="content">
          <h5>Wave Program</h5>

          {#if partOfWaveProgram}
            <WaveBadge waveProgram={partOfWaveProgram} />
          {:else}
            <p style:color="var(--color-foreground-level-5)">
              Issue isn't part of a Wave Program yet.
            </p>
          {/if}
        </div>

        {#if allowAddingOrRemovingWave}
          {#if partOfWaveProgram}
            <SidebarButton icon={Minus} onclick={handleRemoveFromWave}>
              Remove from Wave Program
            </SidebarButton>
          {:else}
            <SidebarButton
              icon={Plus}
              variant="primary"
              disabled={!canBeAddedToAWave}
              onclick={() =>
                modal.show(
                  Stepper,
                  undefined,
                  addIssuesToWaveFlow(waveProgramRepos, [issue], wavePrograms),
                )}
            >
              Add to Wave Program
            </SidebarButton>
          {/if}
        {/if}
      </div>

      {#if (issue.points && issue.state !== 'closed') || issue.pointsEarned}
        {@const multiplier = issue.pointsMultiplier ?? 1}
        {@const hasMultiplier = multiplier > 1}
        {@const complexityBonus = issue.complexity ? getPointsForComplexity(issue.complexity) : 0}
        {@const hasComplexityBonus = complexityBonus > 0}
        {@const basePoints = 100}
        {@const subtotal = basePoints + complexityBonus}
        {@const totalPoints = hasMultiplier ? subtotal * multiplier : subtotal}
        {@const showEarnedPoints = issue.state === 'closed' && issue.pointsEarned != null}
        <div class="sidebar-section">
          <div class="content">
            <h5>Points</h5>

            {#if showEarnedPoints}
              <div class="points-earned">
                <span class="typo-text">Points earned</span>
                <span class="typo-text-bold">{issue.pointsEarned}</span>
              </div>
            {:else}
              <ul class="points-table">
                <li class="points-row">
                  <span class="typo-text">Base Points</span>
                  <span class="typo-text">{basePoints}</span>
                </li>

                {#if hasComplexityBonus}
                  <li class="points-row">
                    <span class="typo-text">Complexity Bonus</span>
                    <span class="typo-text">+{complexityBonus}</span>
                  </li>
                {/if}

                {#if hasMultiplier}
                  <li class="points-row featured-row">
                    <span
                      class="typo-text"
                      style:display="flex"
                      style:align-items="center"
                      style:gap="0.25rem"
                    >
                      <Multiplier
                        style="width: 0.875rem; height: 0.875rem; fill: currentColor; vertical-align: -2px;"
                      />
                      Featured Repo
                    </span>
                    <span class="typo-text">{multiplier}x</span>
                  </li>
                {/if}

                <li class="points-row total-row">
                  <span class="typo-text-bold">Total</span>
                  <span class="typo-text-bold" class:featured-points={hasMultiplier}
                    >{totalPoints}</span
                  >
                </li>
              </ul>
            {/if}

            {#if givenCompliments.length > 0}
              <h5 style:margin-top="1rem">Compliments</h5>
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
            {/if}
          </div>

          {#if isMaintainer && issue.state === 'closed' && issue.assignedApplicant && partOfWaveProgram}
            <SidebarButton
              target=""
              icon={Heart}
              href="/wave/{partOfWaveProgram.slug}/issues/{issue.id}/compliments"
            >
              Give compliment
            </SidebarButton>
          {/if}
        </div>
      {/if}

      {#if issue.complexity || issue.waveProgramId}
        <div class="sidebar-section">
          <div class="content">
            <h5>Complexity</h5>

            {#if issue.complexity}
              <p>{beComplexityToFriendlyLabel(issue.complexity)}</p>
            {:else}
              <p style:color="var(--color-foreground-level-5)">Not set</p>
            {/if}
          </div>

          {#if canUpdateComplexity}
            <SidebarButton icon={Pen} onclick={openUpdateComplexityModal}>
              Update complexity
            </SidebarButton>
          {/if}
        </div>
      {/if}
    </Card>

    {#if showModerationSection}
      <Card style="height: fit-content; padding: 0; overflow: auto;">
        <div class="sidebar-section moderation-section">
          <div class="content">
            <div class="moderation-header">
              <Settings style="width: 1rem; height: 1rem; fill: var(--color-foreground-level-5)" />
              <h5>Moderation</h5>
            </div>
            <p class="moderation-description">Moderator actions for this issue.</p>
          </div>

          <SidebarButton icon={Pen} onclick={openModeratorUpdateComplexityModal}>
            Adjust complexity
          </SidebarButton>

          <div>
            <SidebarButton icon={Trash} onclick={openModeratorRemoveFromWaveModal}>
              Remove from Wave
            </SidebarButton>
          </div>
        </div>
      </Card>
    {/if}
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
    max-height: calc(100dvh - 8.5rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
  }

  .section-headline-with-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sidebar-section .content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  .sidebar-section:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
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

  .moderation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .moderation-description {
    font-size: 0.875rem;
    color: var(--color-foreground-level-5);
  }

  .featured-points {
    color: var(--color-caution-level-6);
  }

  .points-table {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .points-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .points-row.featured-row {
    color: var(--color-caution-level-6);
  }

  .points-row.total-row {
    margin-top: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-foreground-level-3);
  }

  .points-earned {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
</style>

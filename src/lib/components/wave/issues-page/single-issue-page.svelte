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
  import Shield from '$lib/components/icons/Shield.svelte';
  import Flag from '$lib/components/icons/Flag.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
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
  import { flip } from 'svelte/animate';
  import { SvelteMap } from 'svelte/reactivity';
  import { getUserCodeMetrics } from '$lib/utils/wave/users';
  import type { UserCodeMetricsDto } from '$lib/utils/wave/types/user';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import WaveBadge from '../wave-program-badge/wave-program-badge.svelte';
  import ApplicationsFilterBar, {
    type SortOption,
  } from './components/applications-filter-bar.svelte';
  import IssueApplicationCard from './components/issue-application-card/issue-application-card.svelte';
  import IssueApplicationListItem from './components/issue-application-card/issue-application-list-item.svelte';
  import { KEY_METRICS } from './components/issue-application-card/metrics';
  import UpdateComplexityModal from './components/update-complexity-modal.svelte';
  import ModeratorUpdateComplexityModal from './components/moderator-update-complexity-modal.svelte';
  import ModeratorRemoveFromWaveModal from './components/moderator-remove-from-wave-modal.svelte';
  import ModeratorIssuePointsModal from './components/moderator-issue-points-modal.svelte';
  import ModeratorExcludeFromQuotaModal from './components/moderator-exclude-from-quota-modal.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import Lock from '$lib/components/icons/Lock.svelte';
  import Unlock from '$lib/components/icons/Unlock.svelte';
  import reportFlow from '$lib/flows/wave/report/report-flow';
  import SidebarButton from './components/sidebar-button/sidebar-button.svelte';
  import { notifyIssuesUpdated } from './issue-update-coordinator';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Star from '$lib/components/icons/Star.svelte';
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
    applicationsPromise: Promise<Awaited<ReturnType<typeof getIssueApplications>>['data']> | null;

    /** Configuration for button link back to issues list on mobile  */
    backToConfig: { label: string; href: string };

    user: WaveLoggedInUser | null;
    headMetaTitle: string;

    /** Whether viewing in the context of a wave program (e.g. /wave/[slug]/issues/[id]).
     * Used to determine if moderation actions should be shown. */
    isInWaveContext?: boolean;

    /** Whether there's an active wave for the wave program this issue belongs to. */
    activeWaveExists: boolean;

    /** Whether the assigned applicant's application is excluded from quota.
     * null = not applicable or not checked. */
    isExcludedFromQuota?: boolean | null;
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
    isInWaveContext = false,
    activeWaveExists = false,
    isExcludedFromQuota = null,
  }: Props = $props();

  let matchingWaveProgramRepos = $derived(
    waveProgramRepos.filter(
      (waveProgramRepo) =>
        waveProgramRepo.repo.id === issue.repo.id && waveProgramRepo.status === 'approved',
    ),
  );

  const REVIEW_DEADLINE_DAYS = 14;

  let isMaintainer = $derived(matchingWaveProgramRepos.length > 0);
  let isAssignedContributor = $derived(
    Boolean(user && issue.assignedApplicant && user.id === issue.assignedApplicant.id),
  );
  let reviewDeadlineMs = $derived.by(() => {
    const closeDate = issue.gitHubClosedAt;
    if (!closeDate) return null;
    return closeDate.getTime() + REVIEW_DEADLINE_DAYS * 24 * 60 * 60 * 1000;
  });

  let canLeaveReview = $derived(
    issue.state === 'closed' &&
      !!issue.assignedApplicant &&
      !!partOfWaveProgram &&
      (isMaintainer || isAssignedContributor) &&
      reviewDeadlineMs !== null &&
      Date.now() <= reviewDeadlineMs,
  );
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

  let viewMode = $state<'card' | 'list'>('card');
  let sortBy = $state<SortOption>({ key: 'appliedAt', direction: 'asc' });

  let applications = $state<IssueApplicationWithDetailsDto[] | null>(null);
  let promisePending = $state(true);

  const codeMetricsMap = new SvelteMap<string, Promise<UserCodeMetricsDto | null>>();
  const resolvedOssScores = new SvelteMap<string, number | null>();

  $effect(() => {
    promisePending = true;
    codeMetricsMap.clear();
    resolvedOssScores.clear();

    issueApplicationsPromise?.then((apps) => {
      applications = apps;

      for (const app of apps) {
        if (!codeMetricsMap.has(app.applicant.id)) {
          const promise = getUserCodeMetrics(undefined, app.applicant.id);
          codeMetricsMap.set(app.applicant.id, promise);

          // Eagerly resolve OSS scores so they're available for sorting
          promise
            .then((metrics) => {
              resolvedOssScores.set(
                app.applicant.id,
                metrics?.metrics['oss_composite']?.value ?? null,
              );
            })
            .catch(() => {
              resolvedOssScores.set(app.applicant.id, null);
            });
        }
      }

      promisePending = false;
    });
  });

  let sortedApplications = $derived.by(() => {
    if (!applications) return null;

    const ownUserId = user?.id || '';
    const dir = sortBy.direction === 'asc' ? 1 : -1;

    return [...applications].sort((a, b) => {
      // Priority: accepted applications always first, own application second
      const aIsAccepted = a.status === 'accepted';
      const bIsAccepted = b.status === 'accepted';
      if (aIsAccepted && !bIsAccepted) return -1;
      if (!aIsAccepted && bIsAccepted) return 1;

      const aIsOwn = a.applicant.id === ownUserId;
      const bIsOwn = b.applicant.id === ownUserId;
      if (aIsOwn && !bIsOwn) return -1;
      if (!aIsOwn && bIsOwn) return 1;

      // Then sort by selected key
      switch (sortBy.key) {
        case 'appliedAt':
          return dir * (a.appliedAt.getTime() - b.appliedAt.getTime());
        case 'currentWaveAssignmentCount': {
          const aVal = a.applicant.currentWaveAssignmentCount ?? 0;
          const bVal = b.applicant.currentWaveAssignmentCount ?? 0;
          return dir * (aVal - bVal);
        }
        case 'currentWavePointsEarned': {
          const aVal = a.applicant.currentWavePointsEarned ?? 0;
          const bVal = b.applicant.currentWavePointsEarned ?? 0;
          return dir * (aVal - bVal);
        }
        case 'oss_composite': {
          const aScore = resolvedOssScores.get(a.applicant.id) ?? null;
          const bScore = resolvedOssScores.get(b.applicant.id) ?? null;
          if (aScore === null && bScore === null) return 0;
          if (aScore === null) return 1;
          if (bScore === null) return -1;
          return dir * (aScore - bScore);
        }
        default:
          return 0;
      }
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

  function openModeratorExcludeFromQuotaModal() {
    if (!partOfWaveProgram) return;

    modal.show(ModeratorExcludeFromQuotaModal, undefined, {
      issue,
      waveProgram: partOfWaveProgram,
    });
  }

  function openModeratorIssuePointsModal() {
    if (!partOfWaveProgram) return;

    modal.show(ModeratorIssuePointsModal, undefined, {
      issue,
      waveProgram: partOfWaveProgram,
    });
  }

  let canExcludeFromQuota = $derived(
    showModerationSection && issue.state === 'open' && issue.assignedApplicant !== null,
  );

  let canIssuePointsEarly = $derived(
    showModerationSection && issue.assignedApplicant !== null && issue.pointsEarned === null,
  );

  let sidebarEl = $state<HTMLDivElement>();
  let scrolledToTop = $state(true);
  let scrolledToBottom = $state(true);

  function handleSidebarScroll() {
    if (!sidebarEl) return;
    scrolledToTop = sidebarEl.scrollTop <= 1;
    scrolledToBottom = sidebarEl.scrollTop + sidebarEl.clientHeight >= sidebarEl.scrollHeight - 1;
  }

  $effect(() => {
    issue.id; // track issue changes
    if (!sidebarEl) return;
    sidebarEl.scrollTop = 0;
    handleSidebarScroll();
  });

  $effect(() => {
    if (!sidebarEl) return;
    const observer = new ResizeObserver(() => handleSidebarScroll());
    observer.observe(sidebarEl);
    handleSidebarScroll();
    return () => observer.disconnect();
  });
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
              href="https://github.com/{issue.repo.gitHubRepoFullName}"
              size="small"
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
      <section class="applications-section">
        <SectionHeader
          label="Applications"
          icon={Ledger}
          actions={[
            {
              label: 'Apply to work on this issue',
              icon: Ledger,
              variant: 'primary',
              disabled: !canApplyToIssue,
              href: `/wave/${partOfWaveProgram?.slug}/issues/${issue.id}/apply`,
            },
          ]}
          infoTooltip="Contributors can start applying to work on this issue during active Waves."
        />

        <ApplicationsFilterBar bind:viewMode bind:sortBy />

        <SectionSkeleton
          loaded={!promisePending}
          empty={applications?.length === 0}
          emptyStateEmoji="🫙"
          emptyStateHeadline="No applications yet"
          emptyStateText="No-one has applied to this issue in the current Wave."
        >
          {#if viewMode === 'card'}
            <div class="applications-grid">
              {#each sortedApplications ?? [] as application (application.id)}
                <div animate:flip={{ duration: 300 }}>
                  <IssueApplicationCard
                    {user}
                    {issue}
                    {isMaintainer}
                    {application}
                    {activeWaveExists}
                    codeMetricsPromise={codeMetricsMap.get(application.applicant.id) ??
                      Promise.resolve(null)}
                  />
                </div>
              {/each}
            </div>
          {:else}
            <PaddedHorizontalScroll>
              <div class="applications-table">
                <div class="table-header">
                  <h5 class="th">Applicant</h5>
                  <h5 class="th">Application</h5>
                  <h5 class="th">Assignments</h5>
                  <h5 class="th">Points</h5>
                  {#each KEY_METRICS as { label } (label)}
                    <h5 class="th">{label}</h5>
                  {/each}
                  <h5 class="th">Actions</h5>
                </div>
                {#each sortedApplications ?? [] as application (application.id)}
                  <div animate:flip={{ duration: 300 }}>
                    <IssueApplicationListItem
                      {user}
                      {issue}
                      {isMaintainer}
                      {application}
                      {activeWaveExists}
                      codeMetricsPromise={codeMetricsMap.get(application.applicant.id) ??
                        Promise.resolve(null)}
                    />
                  </div>
                {/each}
              </div>
            </PaddedHorizontalScroll>
          {/if}
        </SectionSkeleton>
      </section>
    {/if}
  </div>

  <div
    class="sidebar-wrapper"
    class:fade-top={!scrolledToTop}
    class:fade-bottom={!scrolledToBottom}
  >
    <div class="sidebar" bind:this={sidebarEl} onscroll={handleSidebarScroll}>
      <Card style="height: fit-content; flex: none; padding: 0;">
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

        {#if canLeaveReview && partOfWaveProgram}
          <SidebarButton
            target=""
            icon={Star}
            variant="primary"
            href="/wave/{partOfWaveProgram.slug}/issues/{issue.id}/review"
          >
            Leave a review
          </SidebarButton>
        {/if}

        <div class="sidebar-section">
          <div class="content">
            <h5>Assigned applicant</h5>

            {#if issue.assignedApplicant}
              <GithubUserBadge user={issue.assignedApplicant} />

              <div class="section-headline-with-info" style:margin-top="0.5rem">
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

              <h5 style:margin-top="0.5rem">Org</h5>
              <a class="org-link" href="/wave/orgs/{issue.repo.org.id}">
                <UserAvatar size={24} src={issue.repo.org.gitHubOrgAvatarUrl ?? undefined} />
                <span class="typo-text">{issue.repo.org.gitHubOrgLogin}</span>
              </a>

              {#if issue.addedBy}
                <h5 style:margin-top="0.5rem">Added by</h5>
                <GithubUserBadge user={issue.addedBy} />
              {/if}
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
          {@const showEarnedPoints = issue.pointsEarned != null}
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
            </div>
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

        {#if user && !allowAddingOrRemovingWave}
          <div>
            <SidebarButton
              icon={Flag}
              onclick={() => modal.show(Stepper, undefined, reportFlow('issue', issue.id))}
            >
              Report this issue
            </SidebarButton>
          </div>
        {/if}
      </Card>

      {#if showModerationSection}
        <Card style="height: fit-content; flex: none; padding: 0;">
          <div class="sidebar-section moderation-section">
            <div class="content">
              <div class="moderation-header">
                <Shield style="width: 1rem; height: 1rem; fill: var(--color-foreground-level-5)" />
                <h5>Moderation</h5>
              </div>
              <p class="moderation-description">Moderator actions for this issue.</p>
            </div>

            <div>
              <SidebarButton
                icon={Pen}
                onclick={openModeratorUpdateComplexityModal}
                disabled={issue.pointsEarned != null}
              >
                Adjust complexity
              </SidebarButton>
            </div>

            {#if canIssuePointsEarly}
              <div>
                <SidebarButton icon={Coin} onclick={openModeratorIssuePointsModal}>
                  Issue points early
                </SidebarButton>
              </div>
            {/if}

            {#if canExcludeFromQuota}
              <div>
                <SidebarButton
                  icon={isExcludedFromQuota ? Lock : Unlock}
                  onclick={openModeratorExcludeFromQuotaModal}
                  disabled={isExcludedFromQuota !== false}
                >
                  {isExcludedFromQuota ? 'Excluded from quota' : 'Exclude from quota'}
                </SidebarButton>
              </div>
            {/if}

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
</div>

<style>
  .wrapper {
    height: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 18rem;
  }

  .sidebar-wrapper {
    position: sticky;
    top: 6.5rem;
    align-self: start;
    max-height: calc(100dvh - 5.5rem);
    --fade-size: 1.5rem;
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black var(--fade-size),
      black calc(100% - var(--fade-size)),
      transparent 100%
    );
    transition: mask-image 0.2s;
  }

  .sidebar-wrapper:not(.fade-top) {
    mask-image: linear-gradient(
      to bottom,
      black 0,
      black calc(100% - var(--fade-size)),
      transparent 100%
    );
  }

  .sidebar-wrapper:not(.fade-bottom) {
    mask-image: linear-gradient(to bottom, transparent 0, black var(--fade-size), black 100%);
  }

  .sidebar-wrapper:not(.fade-top):not(.fade-bottom) {
    mask-image: none;
  }

  .sidebar {
    overflow-y: auto;
    max-height: calc(100dvh - 7.5rem);
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

  .org-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
  }

  .sidebar-section:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
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
    margin-bottom: 0.5rem;
    gap: 1rem;
  }

  .applications-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .applications-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  }

  .applications-table {
    --applications-table-columns: 14rem 14rem 7rem 6rem 10rem 9rem 9.5rem max-content;
    width: max-content;
    min-width: 100%;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    min-height: 20rem;
  }

  .applications-table > :last-child :global(.list-row) {
    border-bottom: none;
  }

  .table-header {
    display: grid;
    grid-template-columns: var(--applications-table-columns);
    border-bottom: 1px solid var(--color-foreground-level-2);
    background-color: var(--color-foreground-level-1);
  }

  .th {
    padding: 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .th:first-child {
    padding-left: 0.75rem;
  }

  .th:last-child {
    padding-right: 0.75rem;
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

    .sidebar-wrapper {
      max-height: none;
      mask-image: none;
      padding-bottom: 1rem;
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

  .moderation-section > * + * {
    border-top: 1px solid var(--color-foreground-level-3);
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

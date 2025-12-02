<script lang="ts">
  import { invalidate } from '$app/navigation';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Minus from '$lib/components/icons/Minus.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import addIssuesToWaveFlow from '$lib/flows/wave/add-issues-to-wave/add-issues-to-wave-flow';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getIssue, getIssueApplications } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import type { WaveDto, WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';
  import { beComplexityToFriendlyLabel, removeIssueFromWave } from '$lib/utils/wave/waves';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import WaveBadge from '../wave-badge/wave-badge.svelte';
  import IssueApplicationCard from './components/issue-application-card/issue-application-card.svelte';
  import SidebarButton from './components/sidebar-button/sidebar-button.svelte';
  import { notifyIssuesUpdated } from './issue-update-coordinator';

  interface Props {
    issue: IssueDetailsDto;
    allowAddingOrRemovingWave?: boolean;

    /** User's wave repos - used to determine which waves the issue may be added to */
    waveRepos?: WaveRepoWithDetailsDto[];

    /** Wave the issue is part of, if any */
    partOfWave: WaveDto | null;

    /** For listing available waves to add the issue to */
    waves: WaveDto[];

    /** Applications for the issue in the wave it's currently in. Not awaited, displayed async */
    issueApplicationsPromise: ReturnType<typeof getIssueApplications> | null;
  }

  let {
    issue,
    allowAddingOrRemovingWave,
    waveRepos = [],
    partOfWave,
    waves,
    issueApplicationsPromise,
  }: Props = $props();

  let matchingWaveRepos = $derived(
    waveRepos.filter(
      (waveRepo) => waveRepo.repo.id === issue.repo.id && waveRepo.status === 'approved',
    ),
  );

  let isMaintainer = $derived(matchingWaveRepos.length > 0);
  let canBeAddedToAWave = $derived(isMaintainer && issue.state === 'open');

  async function handleRemoveFromWave() {
    if (!partOfWave) {
      return;
    }

    await doWithConfirmationModal(
      // todo(wave): when someone is assigned, make this message more scary
      `Are you sure you want to remove this issue from the "${partOfWave.name}" Wave?`,
      () => doWithErrorModal(async () => removeIssueFromWave(undefined, partOfWave?.id, issue.id)),
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
      applications = apps.data;
      promisePending = false;
    });
  });

  let canApplyToIssue = $derived(
    partOfWave !== null &&
      // Don't allow applying to own issue
      !allowAddingOrRemovingWave,
  );
</script>

<div
  class="wrapper"
  style:view-transition-name={`issue-${issue.id}`}
  style:view-transition-class="element-handover"
>
  <Card>
    <div class="issue">
      <div class="details-and-description">
        <div class="details">
          <div class="left">
            <h1 class="typo-header-2 line-clamp-3">
              <span style:color="var(--color-foreground-level-5)">#{issue.gitHubIssueNumber}</span>
              {issue.title}
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

      {#if issueApplicationsPromise}
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
                href: `/wave/${partOfWave?.id}/issues/${issue.id}/apply`,
              },
            ],
            infoTooltip:
              'Contributors can start applying to work on this issue during active Wave Cycles.',
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
            {#each applications as application}
              <IssueApplicationCard {issue} {isMaintainer} {application} />
            {/each}
          </div>
        </Section>
      {/if}
    </div>
  </Card>

  <div class="sidebar">
    <Card style="height: fit-content; padding: 0;">
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
          {:else}
            <p style:color="var(--color-foreground-level-5)">No applicant assigned.</p>
          {/if}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="content">
          <h5>Wave</h5>

          {#if partOfWave}
            <WaveBadge wave={partOfWave} />
          {:else}
            <p style:color="var(--color-foreground-level-5)">Issue isn't part of a Wave yet.</p>
          {/if}
        </div>

        {#if allowAddingOrRemovingWave}
          {#if partOfWave}
            <SidebarButton icon={Minus} onclick={handleRemoveFromWave}>
              Remove from Wave
            </SidebarButton>
          {:else}
            <SidebarButton
              icon={Plus}
              variant="primary"
              disabled={!canBeAddedToAWave}
              onclick={() =>
                modal.show(Stepper, undefined, addIssuesToWaveFlow(waveRepos, [issue], waves))}
            >
              Add to Wave
            </SidebarButton>
          {/if}
        {/if}
      </div>

      {#if issue.complexity || issue.waveId}
        <div class="sidebar-section">
          <div class="content">
            <h5>Complexity</h5>

            {#if issue.complexity}
              <p>{beComplexityToFriendlyLabel(issue.complexity)}</p>
            {:else}
              <p style:color="var(--color-foreground-level-5)">Not set</p>
            {/if}
          </div>
        </div>
      {/if}

      <div class="sidebar-section">
        <div class="content">
          <h5>Details</h5>

          <p style:color="var(--color-foreground-level-5)">todo(wave): display some deets</p>
        </div>
      </div>
    </Card>
  </div>
</div>

<style>
  .wrapper {
    height: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 16rem;
  }

  .sidebar {
    position: sticky;
    top: 7.5rem;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
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

  .issue {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
</style>

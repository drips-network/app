<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { acceptIssueApplication, getIssue } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import { notifyIssuesUpdated } from '../../issue-update-coordinator';

  let {
    application,
    isMaintainer,
    issue,
  }: {
    application: IssueApplicationWithDetailsDto;
    isMaintainer: boolean;
    issue: IssueDetailsDto;
  } = $props();

  async function handleAssignApplicant() {
    await doWithConfirmationModal(
      `
        Are you sure you want to assign ${application.applicant.gitHubUsername} to work on this issue?
        They will be assigned to the issue on GitHub, and notified that they can begin working on the issue immediately.
      `,
      () =>
        doWithErrorModal(async () => {
          if (!issue.waveId) throw new Error('Issue is not part of a Wave');

          try {
            await acceptIssueApplication(undefined, issue.waveId, issue.id, application.id);
          } finally {
            await invalidate('wave:issues');

            const newIssueDetails = await getIssue(undefined, issue.id);
            if (newIssueDetails) notifyIssuesUpdated([newIssueDetails]);
          }
        }),
    );
  }
</script>

<Card>
  <div class="issue-application-card">
    <GithubUserBadge link={false} user={application.applicant} />
    <!-- TODO(wave): Applicant metrics -->
    <p class="line-clamp-3">
      <Markdown content={application.applicationText} />
    </p>

    {#if isMaintainer && application.status === 'pending'}
      <Button onclick={handleAssignApplicant}>Assign to issue</Button>
    {:else if application.status === 'accepted'}
      <Button icon={Check} disabled>Applicant assigned</Button>
    {/if}
  </div>
</Card>

<style>
  .issue-application-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>

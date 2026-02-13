import { invalidate } from '$app/navigation';
import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
import doWithErrorModal from '$lib/utils/do-with-error-modal';
import {
  acceptIssueApplication,
  getIssue,
  unassignContributorFromIssue,
  withdrawIssueApplication,
} from '$lib/utils/wave/issues';
import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
import { notifyIssuesUpdated } from '../../issue-update-coordinator';

async function refetchIssue(issueId: string) {
  try {
    await invalidate('wave:issues');
    const newIssueDetails = await getIssue(undefined, issueId);
    if (newIssueDetails) notifyIssuesUpdated([newIssueDetails]);
  } catch {
    // Silently handle refetch errors - action already succeeded
  }
}

export async function handleAssignApplicant(
  issue: IssueDetailsDto,
  application: IssueApplicationWithDetailsDto,
) {
  await doWithConfirmationModal(
    `
      Are you sure you want to assign ${application.applicant.gitHubUsername} to work on this issue?
      They will be assigned to the issue on GitHub, and notified that they can begin working on the issue immediately.
    `,
    () =>
      doWithErrorModal(async () => {
        if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

        await acceptIssueApplication(undefined, issue.waveProgramId, issue.id, application.id);

        await refetchIssue(issue.id);
      }),
  );
}

export async function handleWithdrawApplication(
  issue: IssueDetailsDto,
  application: IssueApplicationWithDetailsDto,
) {
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

        await withdrawIssueApplication(undefined, issue.waveProgramId, issue.id, application.id);

        await refetchIssue(issue.id);
      }),
  );
}

export async function handleUnassignContributor(
  issue: IssueDetailsDto,
  application: IssueApplicationWithDetailsDto,
) {
  await doWithConfirmationModal(
    `
      Are you sure you want to unassign this contributor from the issue?
      They'll be notified to stop working on it immediately, and will not receive any Points.
    `,
    () =>
      doWithErrorModal(async () => {
        if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

        await unassignContributorFromIssue(
          undefined,
          issue.waveProgramId,
          issue.id,
          application.id,
        );

        await refetchIssue(issue.id);
      }),
  );
}

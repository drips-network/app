import { getIssue, getIssueApplications } from '$lib/utils/wave/issues.js';
import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, parent, params }) => {
  const { issues } = await parent();

  // issues is paginated so may not include the issue. in this case, fetch it directly

  const { issueId } = params;

  let issue: IssueDetailsDto | null = issues.data.find((i) => i.id === issueId) ?? null;

  if (!issue) {
    issue = await getIssue(fetch, issueId);

    if (!issue) {
      throw error(404, 'Issue not found');
    }
  }

  // todo(wave): what if more than 100 applications?
  const applicationsPromise = issue.waveId
    ? getIssueApplications(fetch, issue.waveId, issue.id, { limit: 100 })
    : null;

  return {
    issues,
    issue,

    // streamed (not awaited)
    applicationsPromise,
  };
};

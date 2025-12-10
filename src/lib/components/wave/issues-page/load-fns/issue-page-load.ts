import { getComplimentsForIssue } from '$lib/utils/wave/compliments';
import { getIssue, getIssueApplications } from '$lib/utils/wave/issues';
import type { IssueComplimentDto } from '$lib/utils/wave/types/compliment';
import { type IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type { PaginatedResponse } from '$lib/utils/wave/types/pagination';
import type { WaveDto } from '$lib/utils/wave/types/wave';
import { error } from '@sveltejs/kit';

export const issuePageLoad = async (
  {
    fetch,
    parent,
    params,
  }: {
    fetch: typeof global.fetch;
    parent: () => Promise<{ issues: PaginatedResponse<IssueDetailsDto>; waves: WaveDto[] }>;
    params: { issueId: string };
  },
  config: (issue: IssueDetailsDto) => {
    /** On mobile, we display a back button to go back to the issues list. */
    backToConfig: { label: string; href: string };
    allowAddingOrRemovingWave: boolean;
    headMetaTitle: string;
  },
) => {
  const { issues, waves } = await parent();

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

  const partOfWave = waves.find((wave) => wave.id === issue.waveId) ?? null;

  const { backToConfig, allowAddingOrRemovingWave, headMetaTitle } = config(issue);

  let givenCompliments: IssueComplimentDto[] = [];

  if (issue.state === 'closed' && issue.assignedApplicant && issue.waveId) {
    const complimentsRes = await getComplimentsForIssue(fetch, issue.waveId, issue.id);

    givenCompliments = complimentsRes.compliments;
  }

  return {
    issues,
    issue,
    partOfWave,
    allowAddingOrRemovingWave: allowAddingOrRemovingWave,
    backToConfig: backToConfig,
    headMetaTitle: headMetaTitle,
    givenCompliments,

    // streamed (not awaited)
    applicationsPromise,
  };
};

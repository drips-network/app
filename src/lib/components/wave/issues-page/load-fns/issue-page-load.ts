import { getIssue, getIssueApplications } from '$lib/utils/wave/issues';
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
  config: {
    /** On mobile, we display a back button to go back to the issues list. */
    backToConfig: { label: string; href: string };
    allowAddingOrRemovingWave: boolean;
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

  return {
    issues,
    issue,
    partOfWave,
    allowAddingOrRemovingWave: config.allowAddingOrRemovingWave,
    backToConfig: config.backToConfig,

    // streamed (not awaited)
    applicationsPromise,
  };
};

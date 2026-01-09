import { getComplimentsForIssue } from '$lib/utils/wave/compliments';
import { getIssue, getIssueApplications } from '$lib/utils/wave/issues';
import type { IssueComplimentDto } from '$lib/utils/wave/types/compliment';
import { type IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type { PaginatedResponse } from '$lib/utils/wave/types/pagination';
import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
import { error } from '@sveltejs/kit';

export const issuePageLoad = async (
  {
    fetch,
    parent,
    params,
  }: {
    fetch: typeof global.fetch;
    parent: () => Promise<{
      issues: PaginatedResponse<IssueDetailsDto>;
      wavePrograms: WaveProgramDto[];
    }>;
    params: { issueId: string };
  },
  config: (issue: IssueDetailsDto) => {
    /** On mobile, we display a back button to go back to the issues list. */
    backToConfig: { label: string; href: string };
    allowAddingOrRemovingWave: boolean;
    headMetaTitle: string;

    /** Prevent viewing the issue artificially (e.g. on maintainers view, we only want to show
     * issues from the user's own orgs)
    ) */
    block?: {
      errorCode: number;
      message: string;
    } | null;
  },
) => {
  const { issues, wavePrograms } = await parent();

  // issues is paginated so may not include the issue. in this case, fetch it directly

  const { issueId } = params;

  let issue: IssueDetailsDto | null = issues.data.find((i) => i.id === issueId) ?? null;

  if (!issue) {
    issue = await getIssue(fetch, issueId);

    if (!issue) {
      throw error(404, 'Issue not found');
    }
  }

  const { backToConfig, allowAddingOrRemovingWave, headMetaTitle, block } = config(issue);

  if (block) {
    throw error(block.errorCode, block.message);
  }

  // todo(wave): what if more than 100 applications?
  const applicationsPromise = issue.waveProgramId
    ? getIssueApplications(fetch, issue.waveProgramId, issue.id, { limit: 100 })
    : null;

  const partOfWaveProgram = wavePrograms.find((wave) => wave.id === issue.waveProgramId) ?? null;

  let givenCompliments: IssueComplimentDto[] = [];

  if (issue.state === 'closed' && issue.assignedApplicant && issue.waveProgramId) {
    const complimentsRes = await getComplimentsForIssue(fetch, issue.waveProgramId, issue.id);

    givenCompliments = complimentsRes.compliments;
  }

  return {
    issues,
    issue,
    partOfWaveProgram,
    allowAddingOrRemovingWave: allowAddingOrRemovingWave,
    backToConfig: backToConfig,
    headMetaTitle: headMetaTitle,
    givenCompliments,

    // streamed (not awaited)
    applicationsPromise,
  };
};

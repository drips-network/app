import unreachable from '$lib/utils/unreachable';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { getIssue, getIssueApplications } from '$lib/utils/wave/issues';
import { type IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type { PaginatedResponse } from '$lib/utils/wave/types/pagination';
import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
import { getWaves } from '$lib/utils/wave/wavePrograms';
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
      activeWaveExists?: boolean;
    }>;
    params: { issueId: string };
  },
  config: (issue: IssueDetailsDto) => {
    /** On mobile, we display a back button to go back to the issues list. */
    backToConfig: { label: string; href: string };
    allowAddingOrRemovingWave: boolean;
    headMetaTitle: string;

    /** Whether viewing in the context of a wave program (e.g. /wave/[slug]/issues/[id]).
     * Used to determine if moderation actions should be shown. */
    isInWaveContext?: boolean;

    /** Prevent viewing the issue artificially (e.g. on maintainers view, we only want to show
     * issues from the user's own orgs)
    ) */
    block?: {
      errorCode: number;
      message: string;
    } | null;
  },
) => {
  const { issues, wavePrograms, activeWaveExists } = await parent();

  // issues is paginated so may not include the issue. in this case, fetch it directly

  const { issueId } = params;

  let issue: IssueDetailsDto | null = issues.data.find((i) => i.id === issueId) ?? null;

  if (!issue) {
    issue = await getIssue(fetch, issueId);

    if (!issue) {
      throw error(404, 'Issue not found');
    }
  }

  const { backToConfig, allowAddingOrRemovingWave, headMetaTitle, isInWaveContext, block } =
    config(issue);

  if (block) {
    throw error(block.errorCode, block.message);
  }

  const applicationsPromise = issue.waveProgramId
    ? getAllPaginated((page, limit) =>
        getIssueApplications(
          fetch,
          issue.waveProgramId ?? unreachable(),
          issue.id,
          {
            page,
            limit,
          },
          { waveId: 'current' },
        ),
      )
    : null;

  const partOfWaveProgram = wavePrograms.find((wave) => wave.id === issue.waveProgramId) ?? null;

  // If activeWaveExists wasn't provided by parent (e.g. in maintainer/contributor contexts),
  // fetch the waves for this issue's wave program and check if any is active
  let resolvedActiveWaveExists = activeWaveExists;
  if (resolvedActiveWaveExists === undefined && issue.waveProgramId) {
    const waves = await getWaves(fetch, issue.waveProgramId, { limit: 1 }, { status: 'active' });
    resolvedActiveWaveExists = waves.data.some((wave) => wave.status === 'active');
  }

  return {
    issues,
    issue,
    partOfWaveProgram,
    allowAddingOrRemovingWave: allowAddingOrRemovingWave,
    backToConfig: backToConfig,
    headMetaTitle: headMetaTitle,
    isInWaveContext: isInWaveContext ?? false,
    activeWaveExists: resolvedActiveWaveExists ?? false,

    // streamed (not awaited)
    applicationsPromise,
  };
};

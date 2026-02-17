import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';
import { moderatorGetQuotaExclusion } from '$lib/utils/wave/wavePrograms';

export const load = async (context) => {
  const { waveProgram, user } = await context.parent();

  const result = await issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: false,
    backToConfig: { label: 'Back to issues', href: `/wave/${waveProgram.slug}/issues` },
    headMetaTitle: `${issue.title} | ${waveProgram.name} Wave`,
    isInWaveContext: true,
  }));

  const canModerate = user?.permissions?.includes('moderateWaveIssues') ?? false;
  const shouldCheckQuota =
    canModerate && result.issue.assignedApplicant && result.partOfWaveProgram;

  let isExcludedFromQuota: boolean | null = null;
  if (shouldCheckQuota) {
    try {
      const res = await moderatorGetQuotaExclusion(
        context.fetch,
        result.partOfWaveProgram!.id,
        result.issue.id,
      );
      isExcludedFromQuota = res.excluded;
    } catch {
      isExcludedFromQuota = false;
    }
  }

  return {
    ...result,
    isExcludedFromQuota,
  };
};

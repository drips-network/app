import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = async (context) => {
  const { waveProgram } = await context.parent();

  return issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: false,
    backToConfig: { label: 'Back to issues', href: `/wave/${waveProgram.slug}/issues` },
    headMetaTitle: `${issue.title} | ${waveProgram.name} Wave`,
    isInWaveContext: true,
  }));
};

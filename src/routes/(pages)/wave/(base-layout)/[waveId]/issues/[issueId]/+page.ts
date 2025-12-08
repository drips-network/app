import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = async (context) => {
  const { wave } = await context.parent();

  return issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: false,
    backToConfig: { label: 'Back to issues', href: `/wave/${context.params.waveId}/issues` },
    headMetaTitle: `${issue.title} | ${wave.name} Wave`,
  }));
};

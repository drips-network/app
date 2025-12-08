import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = (context) =>
  issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: false,
    backToConfig: { label: 'Back to issues', href: `/wave/contributors/issues` },
    headMetaTitle: `${issue.title} | Contributor Dashboard`,
  }));

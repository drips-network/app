import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = (context) =>
  issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: true,
    backToConfig: { label: 'Back to issues', href: `/wave/maintainers/issues` },
    headMetaTitle: `${issue.title} | Maintainer Dashboard`,
  }));

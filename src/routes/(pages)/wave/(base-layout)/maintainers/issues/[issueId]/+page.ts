import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = (context) =>
  issuePageLoad(context, {
    allowAddingOrRemovingWave: true,
    backToConfig: { label: 'Back to issues', href: `/wave/maintainers/issues` },
  });

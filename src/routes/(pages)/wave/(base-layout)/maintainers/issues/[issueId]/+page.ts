import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = (context) =>
  issuePageLoad(context, {
    allowAddingOrRemovingWave: true,
  });

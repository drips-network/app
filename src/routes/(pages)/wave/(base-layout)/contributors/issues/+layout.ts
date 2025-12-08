import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = (context) =>
  issuesPageLayoutLoad(context, (user) => ({
    requireLogin: true,
    preappliedFilters: {
      isInWave: true,
      appliedToByUser: user?.id,
    },
    pathPrefix: '/wave/contributors/issues/',
    filtersMode: 'contributor',
    breadcrumbs: [{ label: 'Contributor Dashboard' }, { label: 'Issues' }],
    viewKey: 'contributors',
  }));

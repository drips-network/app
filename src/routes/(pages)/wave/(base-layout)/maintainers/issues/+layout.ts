import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = (context) =>
  issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      mine: true,
      eligibleForWave: true,
    },
    pathPrefix: '/wave/maintainers/issues/',
    filtersMode: 'maintainer',
    breadcrumbs: [{ label: 'Maintainer Dashboard' }, { label: 'Issues' }],
    viewKey: 'maintainers',
    allowAddToWave: true,
    headMetaTitle: 'Issues | Maintainer Dashboard',
  }));

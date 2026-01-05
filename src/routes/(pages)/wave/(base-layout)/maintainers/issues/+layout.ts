import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = (context) =>
  issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      mine: true,
      eligibleForWaveProgram: true,
    },
    defaultFilters: {
      state: 'open',
    },
    pathPrefix: '/wave/maintainers/issues/',
    filtersMode: 'maintainer',
    breadcrumbs: [{ label: 'Maintainer Dashboard' }, { label: 'Issues' }],
    viewKey: 'maintainers',
    allowAddToWaveProgram: true,
    headMetaTitle: 'Issues | Maintainer Dashboard',
    showNewApplicationsBadge: true,
    emptyStateAnnotation:
      'Missing something? This view shows only issues from repos synced with Drips Wave and approved for at least one Wave Program. Head to the Orgs & Repos screen to manage your repos.',
  }));

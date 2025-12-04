import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = (context) =>
  issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      waveId: context.params.waveId,
    },
    pathPrefix: `/wave/${context.params.waveId}/issues/`,
    filtersMode: 'wave',
    breadcrumbs: [{ label: 'Maintainer Dashboard' }, { label: 'Issues' }],
    viewKey: context.params.waveId,
    availableSortByOptions: ['updatedAt', 'createdAt', 'points'],
  }));

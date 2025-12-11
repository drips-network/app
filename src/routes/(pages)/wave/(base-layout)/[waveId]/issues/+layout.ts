import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = async (context) => {
  const { parent } = context;
  const { wave } = await parent();

  return issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      waveId: context.params.waveId,
    },
    defaultFilters: {
      state: 'open',
    },
    pathPrefix: `/wave/${context.params.waveId}/issues/`,
    filtersMode: 'wave',
    breadcrumbs: [
      { label: 'Waves', href: `/wave` },
      { label: wave.name, href: `/wave/${context.params.waveId}` },
      { label: 'Issues' },
    ],
    viewKey: context.params.waveId,
    availableSortByOptions: ['updatedAt', 'createdAt', 'points'],
    headMetaTitle: `Issues | ${wave.name} Wave`,
  }));
};

import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = async (context) => {
  const { parent } = context;
  const { waveProgram } = await parent();

  return issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      waveProgramId: context.params.waveProgramId,
    },
    defaultFilters: {
      state: 'open',
    },
    pathPrefix: `/wave/${context.params.waveProgramId}/issues/`,
    filtersMode: 'wave',
    breadcrumbs: [
      { label: 'Wave Programs', href: `/wave` },
      { label: waveProgram.name, href: `/wave/${context.params.waveProgramId}` },
      { label: 'Issues' },
    ],
    viewKey: context.params.waveProgramId,
    availableSortByOptions: ['updatedAt', 'createdAt', 'points'],
    headMetaTitle: `Issues | ${waveProgram.name} Wave`,
  }));
};

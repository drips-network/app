import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';

export const load = async (context) => {
  const { parent } = context;
  const { waveProgram } = await parent();

  return issuesPageLayoutLoad(context, () => ({
    preappliedFilters: {
      waveProgramId: waveProgram.id,
    },
    defaultFilters: {
      state: 'open',
    },
    pathPrefix: `/wave/${waveProgram.slug}/issues/`,
    filtersMode: 'wave',
    breadcrumbs: [
      { label: 'Wave Programs', href: `/wave` },
      { label: waveProgram.name, href: `/wave/${waveProgram.slug}` },
      { label: 'Issues' },
    ],
    viewKey: waveProgram.slug,
    availableSortByOptions: ['updatedAt', 'createdAt', 'points'],
    headMetaTitle: `Issues | ${waveProgram.name} Wave`,
    emptyStateAnnotation: `
      This view only shows issues added to the ${waveProgram.name} Wave Program by approved maintainers. Head to the Contributor dashboard to see all issues relevant to you. If you're a maintainer, check your Maintainer dashboard to add issues to this Wave Program.
    `,
  }));
};

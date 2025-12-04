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

// export const load = async ({ fetch, url, depends, parent }) => {
//   const { user } = await parent();

//   if (!user) {
//     throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
//   }

//   depends('wave:issues');

//   const filtersParam = url.searchParams.get('filters');
//   const filtersParamDecoded = filtersParam ? atob(filtersParam) : null;
//   const filtersParamParseResult = issueFilters
//     .nullable()
//     .safeParse(filtersParamDecoded ? JSON.parse(filtersParamDecoded) : null);

//   if (!filtersParamParseResult.success) {
//     // redirect to same page without invalid filters
//     throw redirect(302, '/wave/maintainers/issues');
//   }

//   const filters: IssueFilters = filtersParamParseResult.data || {};

//   // Contributors can only see issues that are part of a wave
//   filters.isInWave = true;

//   // Contributors can only see issues they have applied to on this view
//   filters.appliedToByUser = user.id;

//   const [issues, waves] = await Promise.all([
//     getIssues(fetch, { limit: 10 }, filters),
//     // todo(wave): Only fetch waves included in the issues list
//     getWaves(fetch, { limit: 100 }),
//   ]);

//   return {
//     issues,
//     appliedFilters: filters,
//     waves,
//     waveHeaderBackground: false,
//   };
// };

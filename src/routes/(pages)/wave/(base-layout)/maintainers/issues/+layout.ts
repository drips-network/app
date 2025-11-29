import { getIssues } from '$lib/utils/wave/issues';
import { issueFilters, type IssueFilters } from '$lib/utils/wave/types/issue.js';
import { getOwnWaveRepos, getWaves } from '$lib/utils/wave/waves.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, url, depends }) => {
  depends('wave:issues');

  const filtersParam = url.searchParams.get('filters');
  const filtersParamDecoded = filtersParam ? atob(filtersParam) : null;
  const filtersParamParseResult = issueFilters
    .nullable()
    .safeParse(filtersParamDecoded ? JSON.parse(filtersParamDecoded) : null);

  if (!filtersParamParseResult.success) {
    // redirect to same page without invalid filters
    throw redirect(302, '/wave/maintainers/issues');
  }

  const filters: IssueFilters = filtersParamParseResult.data || {};

  // Maintainers can only see issues that are part of an approved Wave repo
  filters.eligibleForWave = true;

  // Maintainers can only see issues from their own repos here
  filters.mine = true;

  const [issues, waveRepos, waves] = await Promise.all([
    getIssues(fetch, { limit: 10 }, filters),
    // todo(wave): pagination
    getOwnWaveRepos(fetch, { limit: 100 }),
    // todo(wave): Only fetch waves included in the issues list
    getWaves(fetch, { limit: 100 }),
  ]);

  return {
    issues,
    appliedFilters: filters,
    waveRepos,
    waves,
    waveHeaderBackground: false,
  };
};

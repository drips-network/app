import { getIssues } from '$lib/utils/wave/issues';
import { issueFilters } from '$lib/utils/wave/types/issue.js';
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

  const filters = filtersParamParseResult.data || {};

  const issues = await getIssues(
    fetch,
    { limit: 10 },
    {
      ...filters,
      mine: true,
    },
  );

  return {
    issues,
    appliedFilters: filters,
  };
};

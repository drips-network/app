import type { WaveProgramReposFilters } from '$lib/utils/wave/types/waveProgram.js';
import { waveProgramReposFiltersSchema } from '$lib/utils/wave/types/waveProgram.js';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { getWaveProgramOrgs, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { waveProgram } = await parent();

  const filtersParam = url.searchParams.get('filters');
  const filtersParamDecoded = filtersParam ? atob(filtersParam) : null;
  const filtersParamParseResult = waveProgramReposFiltersSchema
    .nullable()
    .safeParse(filtersParamDecoded ? JSON.parse(filtersParamDecoded) : null);

  if (!filtersParamParseResult.success) {
    // redirect to same page without invalid filters
    const currentParams = new URLSearchParams(url.search);
    currentParams.delete('filters');

    throw redirect(302, `${url.pathname}${currentParams.toString()}`);
  }

  const filters: WaveProgramReposFilters = filtersParamParseResult.data || {
    sortBy: 'stargazersCount',
  };

  const repos = await getWaveProgramRepos(
    fetch,
    waveProgram.id,
    {
      limit: 20,
    },
    filters,
  );

  // Streamed — not awaited so it doesn't block page load
  const orgsPromise = getAllPaginated((page, limit) =>
    getWaveProgramOrgs(fetch, waveProgram.id, { page, limit }),
  );

  return {
    repos,
    filters,
    orgsPromise,
  };
};

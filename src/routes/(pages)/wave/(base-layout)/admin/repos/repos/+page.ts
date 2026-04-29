import type { WaveProgramReposFilters } from '$lib/utils/wave/types/waveProgram.js';
import { waveProgramReposFiltersSchema } from '$lib/utils/wave/types/waveProgram.js';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { getWaveProgramOrgs, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { wavePrograms } = await parent();

  // Get waveProgramId from URL, or default to the first one
  let waveProgramId = url.searchParams.get('waveProgramId');

  if (!waveProgramId && wavePrograms.data.length > 0) {
    waveProgramId = wavePrograms.data[0].id;
    const currentUrl = new URL(url);
    currentUrl.searchParams.set('waveProgramId', waveProgramId);
    throw redirect(302, `${currentUrl.pathname}?${currentUrl.searchParams.toString()}`);
  }

  if (!waveProgramId) {
    return { repos: null, filters: {}, waveProgramId: null, orgsPromise: Promise.resolve([]) };
  }

  // Parse filters from URL
  const filtersParam = url.searchParams.get('filters');
  const filtersParamDecoded = filtersParam ? atob(filtersParam) : null;
  const filtersParamParseResult = waveProgramReposFiltersSchema
    .nullable()
    .safeParse(filtersParamDecoded ? JSON.parse(filtersParamDecoded) : null);

  if (!filtersParamParseResult.success) {
    const currentParams = new URLSearchParams(url.search);
    currentParams.delete('filters');
    throw redirect(302, `${url.pathname}?${currentParams.toString()}`);
  }

  const filters: WaveProgramReposFilters = filtersParamParseResult.data || {
    sortBy: 'stargazersCount',
  };

  const repos = await getWaveProgramRepos(fetch, waveProgramId, { limit: 20 }, filters);

  const orgsPromise = getAllPaginated((page, limit) =>
    getWaveProgramOrgs(fetch, waveProgramId!, { page, limit }),
  );

  return {
    repos,
    filters,
    waveProgramId,
    orgsPromise,
  };
};

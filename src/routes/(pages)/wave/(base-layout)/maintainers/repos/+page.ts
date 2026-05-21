import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { getOwnWaveProgramRepos, getWavePrograms } from '$lib/utils/wave/wavePrograms.js';
import { waveProgramRepoStatusSchema } from '$lib/utils/wave/types/waveProgram.js';

export const load = async ({ fetch, depends, url }) => {
  depends('wave:orgs-and-repos');

  const rawStatus = url.searchParams.get('status');
  const statusFilter = rawStatus
    ? (waveProgramRepoStatusSchema.safeParse(rawStatus).data ?? null)
    : null;

  const [waveProgramRepos, approvedWaveProgramReposData, wavePrograms] = await Promise.all([
    // todo(wave): pagination
    getOwnWaveProgramRepos(
      fetch,
      { limit: 100 },
      statusFilter ? { status: statusFilter } : undefined,
    ),
    // Always fetch approved repos regardless of the page filter — the Orgs
    // section is derived from these and shouldn't change when the user filters
    // the repo applications list.
    getAllPaginated((page, limit) =>
      getOwnWaveProgramRepos(fetch, { page, limit }, { status: 'approved' }),
    ),
    // todo(wave): Only fetch waves included in the repos list
    getWavePrograms(fetch, { limit: 100 }),
  ]);

  return {
    waveProgramRepos,
    approvedWaveProgramRepos: {
      data: approvedWaveProgramReposData,
      pagination: {
        total: approvedWaveProgramReposData.length,
        page: 1,
        limit: approvedWaveProgramReposData.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    wavePrograms,
    statusFilter,
  };
};

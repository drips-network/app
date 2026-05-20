import { getOwnWaveProgramRepos, getWavePrograms } from '$lib/utils/wave/wavePrograms.js';
import { waveProgramRepoStatusSchema } from '$lib/utils/wave/types/waveProgram.js';

export const load = async ({ fetch, depends, url }) => {
  depends('wave:orgs-and-repos');

  const rawStatus = url.searchParams.get('status');
  const statusFilter = rawStatus
    ? (waveProgramRepoStatusSchema.safeParse(rawStatus).data ?? null)
    : null;

  const [waveProgramRepos, approvedWaveProgramRepos, wavePrograms] = await Promise.all([
    // todo(wave): pagination
    getOwnWaveProgramRepos(
      fetch,
      { limit: 100 },
      statusFilter ? { status: statusFilter } : undefined,
    ),
    // Always fetch approved repos regardless of the page filter — the Orgs
    // section is derived from these and shouldn't change when the user filters
    // the repo applications list.
    statusFilter === 'approved'
      ? null
      : getOwnWaveProgramRepos(fetch, { limit: 100 }, { status: 'approved' }),
    // todo(wave): Only fetch waves included in the repos list
    getWavePrograms(fetch, { limit: 100 }),
  ]);

  return {
    waveProgramRepos,
    approvedWaveProgramRepos: approvedWaveProgramRepos ?? waveProgramRepos,
    wavePrograms,
    statusFilter,
  };
};

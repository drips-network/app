import { getOwnWaveProgramRepos, getWavePrograms } from '$lib/utils/wave/wavePrograms.js';
import type { WaveProgramRepoStatus } from '$lib/utils/wave/types/waveProgram.js';

export const load = async ({ fetch, depends, url }) => {
  depends('wave:orgs-and-repos');

  const statusFilter = url.searchParams.get('status') as WaveProgramRepoStatus | null;

  const [waveProgramRepos, wavePrograms] = await Promise.all([
    // todo(wave): pagination
    getOwnWaveProgramRepos(
      fetch,
      { limit: 100 },
      statusFilter ? { status: statusFilter } : undefined,
    ),
    // todo(wave): Only fetch waves included in the repos list
    getWavePrograms(fetch, { limit: 100 }),
  ]);

  return {
    waveProgramRepos,
    wavePrograms,
    statusFilter,
  };
};

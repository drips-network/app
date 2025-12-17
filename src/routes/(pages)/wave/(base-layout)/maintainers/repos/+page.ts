import { getOwnWaveProgramRepos, getWavePrograms } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ fetch, depends }) => {
  depends('wave:orgs-and-repos');

  const [waveProgramRepos, wavePrograms] = await Promise.all([
    // todo(wave): pagination
    getOwnWaveProgramRepos(fetch, { limit: 100 }),
    // todo(wave): Only fetch waves included in the repos list
    getWavePrograms(fetch, { limit: 100 }),
  ]);

  return {
    waveProgramRepos,
    wavePrograms,
  };
};

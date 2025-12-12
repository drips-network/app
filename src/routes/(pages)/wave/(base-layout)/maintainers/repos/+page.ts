import { getOwnWaveRepos, getWaves } from '$lib/utils/wave/waves.js';

export const load = async ({ fetch, depends }) => {
  depends('wave:orgs-and-repos');

  const [waveRepos, waves] = await Promise.all([
    // todo(wave): pagination
    getOwnWaveRepos(fetch, { limit: 100 }),
    // todo(wave): Only fetch waves included in the repos list
    getWaves(fetch, { limit: 100 }),
  ]);

  return {
    waveRepos,
    waves,
  };
};

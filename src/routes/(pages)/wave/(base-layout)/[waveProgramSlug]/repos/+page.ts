import { getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ parent, fetch }) => {
  const { waveProgram } = await parent();

  const repos = await getWaveProgramRepos(fetch, waveProgram.id, {
    // todo(wave): pagination
    limit: 100,
  });

  return {
    repos,
  };
};

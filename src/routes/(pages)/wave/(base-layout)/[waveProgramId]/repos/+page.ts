import { getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ params, fetch }) => {
  const { waveProgramId } = params;

  const repos = await getWaveProgramRepos(fetch, waveProgramId, {
    // todo(wave): pagination
    limit: 100,
  });

  return {
    repos,
  };
};

import { getWaveRepos } from '$lib/utils/wave/waves';

export const load = async ({ params, fetch }) => {
  const { waveId } = params;

  const repos = await getWaveRepos(fetch, waveId, {
    // todo(wave): pagination
    limit: 100,
  });

  return {
    repos,
  };
};

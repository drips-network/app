import { getWavePrograms } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ fetch }) => {
  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  return {
    wavePrograms,
  };
};

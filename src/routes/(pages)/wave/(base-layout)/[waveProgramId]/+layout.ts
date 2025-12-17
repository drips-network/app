import { getWaveProgram, getWaves } from '$lib/utils/wave/wavePrograms.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const { waveProgramId } = params;

  const [waveProgram, waves] = await Promise.all([
    getWaveProgram(fetch, waveProgramId),
    // TODO(wave): Pagination
    getWaves(fetch, waveProgramId, { limit: 100 }),
  ]);

  if (!waveProgram) {
    throw error(404, 'Wave not found');
  }

  return {
    waveProgram,
    waves,
  };
};

import { getWave, getWaveCycles } from '$lib/utils/wave/waves.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const { waveId } = params;

  const [wave, cycles] = await Promise.all([
    getWave(fetch, waveId),
    // TODO(wave): Pagination
    getWaveCycles(fetch, waveId, { limit: 100 }),
  ]);

  if (!wave) {
    throw error(404, 'Wave not found');
  }

  return {
    wave,
    cycles,
  };
};

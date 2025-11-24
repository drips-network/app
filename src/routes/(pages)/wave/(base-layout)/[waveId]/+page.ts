import { getWave } from '$lib/utils/wave/waves.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const { waveId } = params;

  const wave = await getWave(fetch, waveId);

  if (!wave) {
    throw error(404, 'Wave not found');
  }

  return {
    wave,
  };
};

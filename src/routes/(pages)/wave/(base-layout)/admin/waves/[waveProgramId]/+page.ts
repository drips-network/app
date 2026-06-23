import { getWaveProgram, getWaves } from '$lib/utils/wave/wavePrograms';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends, params }) => {
  depends('wave:admin:waves:program');

  const { user } = await parent();

  if (!user.permissions?.includes('manageWaves')) {
    throw redirect(302, '/wave/admin');
  }

  const waveProgram = await getWaveProgram(fetch, params.waveProgramId);

  if (!waveProgram) {
    throw error(404, 'Wave program not found');
  }

  const waves = await getAllPaginated((page, limit) =>
    getWaves(fetch, waveProgram.id, { page, limit }),
  );

  // Sort by waveNumber descending (newest first)
  waves.sort((a, b) => b.waveNumber - a.waveNumber);

  return {
    waveProgram,
    waves,
  };
};

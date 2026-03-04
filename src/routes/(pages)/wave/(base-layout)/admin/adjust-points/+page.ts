import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { getWavePrograms, getWaves } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:admin:adjust-points');

  const { user } = await parent();

  if (!user.permissions?.includes('managePoints')) {
    throw redirect(302, '/wave/admin');
  }

  const wavePrograms = await getAllPaginated((page, limit) =>
    getWavePrograms(fetch, { page, limit }),
  );

  const wavesByProgram: Record<string, Awaited<ReturnType<typeof getWaves>>['data']> = {};

  for (const program of wavePrograms) {
    const waves = await getAllPaginated((page, limit) =>
      getWaves(fetch, program.id, { page, limit }),
    );
    wavesByProgram[program.id] = waves;
  }

  return {
    wavePrograms,
    wavesByProgram,
  };
};

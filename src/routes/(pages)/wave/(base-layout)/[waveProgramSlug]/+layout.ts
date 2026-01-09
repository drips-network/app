import { getWaveProgram, getWaves } from '$lib/utils/wave/wavePrograms.js';
import { error } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ params, fetch }) => {
  const { waveProgramSlug } = params;

  // block fetching by UUID (we only want the slug URLs to work)
  if (z.uuid().safeParse(waveProgramSlug).success) {
    throw error(404, 'Wave not found');
  }

  const [waveProgram] = await Promise.all([getWaveProgram(fetch, waveProgramSlug)]);

  if (!waveProgram) {
    throw error(404, 'Wave not found');
  }

  // todo(wave): pagination, parallelize
  const waves = await getWaves(fetch, waveProgram.id, { limit: 100 });

  return {
    waveProgram,
    waves,
  };
};

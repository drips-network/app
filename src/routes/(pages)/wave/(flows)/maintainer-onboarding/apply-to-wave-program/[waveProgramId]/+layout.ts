import { getWaveProgram } from '$lib/utils/wave/wavePrograms.js';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [waveProgram] = await Promise.all([getWaveProgram(fetch, params.waveProgramId)]);

  if (!waveProgram) {
    throw error(404, 'Wave not found');
  }

  return {
    waveProgram,
  };
};

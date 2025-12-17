import { getWaveProgram } from '$lib/utils/wave/wavePrograms.js';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [waveProgram] = await Promise.all([getWaveProgram(fetch, params.waveId)]);

  if (!waveProgram) {
    throw error(404, 'Wave Program not found');
  }

  return {
    waveProgram,
  };
};

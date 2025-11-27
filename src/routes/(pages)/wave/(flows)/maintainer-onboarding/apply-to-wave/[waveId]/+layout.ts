import { getWave } from '$lib/utils/wave/waves.js';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [wave] = await Promise.all([getWave(fetch, params.waveId)]);

  if (!wave) {
    throw error(404, 'Wave not found');
  }

  return {
    wave,
  };
};

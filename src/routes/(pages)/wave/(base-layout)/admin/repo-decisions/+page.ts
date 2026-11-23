import { getWavePrograms } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch }) => {
  const { user } = await parent();

  if (!user.permissions?.includes('reviewWaveProgramRepos')) {
    throw redirect(302, '/wave/admin');
  }

  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  return { wavePrograms };
};

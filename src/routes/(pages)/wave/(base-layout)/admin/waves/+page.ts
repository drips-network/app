import { getWavePrograms } from '$lib/utils/wave/wavePrograms';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:admin:waves');

  const { user } = await parent();

  if (!user.permissions?.includes('manageWaves')) {
    throw redirect(302, '/wave/admin');
  }

  const wavePrograms = await getAllPaginated((page, limit) =>
    getWavePrograms(fetch, { page, limit }),
  );

  return {
    wavePrograms,
  };
};

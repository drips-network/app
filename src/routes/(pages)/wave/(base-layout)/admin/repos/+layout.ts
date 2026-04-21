import { getTags } from '$lib/utils/wave/tags.js';
import { getWavePrograms } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:admin:repos');

  const { user } = await parent();

  const canManageTags = user.permissions?.includes('manageTags');
  const canFeatureRepos = user.permissions?.includes('featureWaveRepos');
  const canManagePoints = user.permissions?.includes('managePoints');

  if (!canManageTags && !canFeatureRepos && !canManagePoints) {
    throw redirect(302, '/wave/admin');
  }

  const [wavePrograms, tags] = await Promise.all([
    getWavePrograms(fetch, { limit: 100 }),
    getTags(fetch, { pageSize: 100 }),
  ]);

  return {
    wavePrograms,
    tags,
    canManageTags: !!canManageTags,
    canFeatureRepos: !!canFeatureRepos,
    canManagePoints: !!canManagePoints,
  };
};

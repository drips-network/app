import { getOrgs, getOwnRepos } from '$lib/utils/wave/orgs';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { getOwnWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [ownRepos, ownOrgs, ownWaveProgramRepos] = await Promise.all([
    getAllPaginated((page, limit, cursor) => getOwnRepos(fetch, { page, limit, cursor })),
    getOrgs(fetch, { limit: 100 }),
    getOwnWaveProgramRepos(fetch, { limit: 100 }),
  ]);

  if (ownRepos.length === 0) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  return {
    ownRepos,
    ownOrgs,
    ownWaveProgramRepos,
  };
};

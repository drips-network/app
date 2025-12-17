import { getOwnRepos } from '$lib/utils/wave/orgs';
import { getOwnWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [ownRepos, ownWaveProgramRepos] = await Promise.all([
    getOwnRepos(fetch, { limit: 100 }),
    getOwnWaveProgramRepos(fetch, { limit: 100 }),
  ]);

  if (ownRepos.pagination.total === 0) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  return {
    ownRepos,
    ownWaveProgramRepos,
  };
};

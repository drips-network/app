import { getOwnRepos } from '$lib/utils/wave/orgs';
import { getOwnWaveRepos } from '$lib/utils/wave/waves.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, depends }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [ownRepos, ownWaveRepos] = await Promise.all([
    getOwnRepos(fetch, { limit: 100 }),
    getOwnWaveRepos(fetch, { limit: 100 }),
  ]);

  if (ownRepos.pagination.total === 0) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  return {
    ownRepos,
    ownWaveRepos,
  };
};

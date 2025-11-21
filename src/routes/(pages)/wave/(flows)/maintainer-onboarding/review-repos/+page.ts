import { getOrgs, getOwnRepos } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:maintainer-onboarding-review-repos');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/review-repos');
  }

  const [userOrgs, ownRepos] = await Promise.all([getOrgs(fetch), getOwnRepos(fetch)]);

  if (!userOrgs || userOrgs.data.length === 0) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  return {
    userOrgs,
    ownRepos,
  };
};

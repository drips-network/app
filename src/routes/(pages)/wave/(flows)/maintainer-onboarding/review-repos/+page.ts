import { getOrgs, getOwnRepos, getUntrackedRepos } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:maintainer-onboarding-review-repos');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/review-repos');
  }

  const [userOrgs, ownRepos, untrackedRepos] = await Promise.all([
    getOrgs(fetch, { limit: 100 }),
    getOwnRepos(fetch, { limit: 100 }),
    // Best-effort: this is served live from GitHub by the backend, so a
    // failure should degrade to "no warnings" rather than break the page.
    getUntrackedRepos(fetch).catch(() => ({ data: [] })),
  ]);

  if (!userOrgs || userOrgs.data.length === 0) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  return {
    userOrgs,
    ownRepos,
    untrackedRepos,
  };
};

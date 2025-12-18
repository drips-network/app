import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // todo(wave): avoid fetching all orgs here
  // we currently do that so that the single issues page can check whether
  // the issue is part of the user's orgs
  const userOrgs = await getOrgs(fetch, { limit: 100 });

  const hasOrgs = userOrgs.data.length > 0;

  if (!hasOrgs) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app?onCancelGoto=/wave');
  }

  return {
    hasOrgs,
    userOrgs,
  };
};

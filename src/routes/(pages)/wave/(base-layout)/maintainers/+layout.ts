import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const userOrgs = await getOrgs(fetch, { limit: 1 });

  const hasOrgs = userOrgs.data.length > 0;

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/install-app');
  }

  return {
    hasOrgs,
  };
};

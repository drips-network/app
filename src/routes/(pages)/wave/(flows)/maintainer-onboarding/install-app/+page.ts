import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/install-app');
  }

  const userOrgs = await getOrgs(fetch);

  return {
    userOrgs,
  };
};

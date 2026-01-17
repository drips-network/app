import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';
import isSafePath from '$lib/utils/safe-path';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/install-app');
  }

  const userOrgs = await getOrgs(fetch, { limit: 100 });

  const onCancelGoto = url.searchParams.get('onCancelGoto');
  const decoded = decodeURIComponent(onCancelGoto || '');

  // Validate to prevent open redirect attacks
  const safeOnCancelGoto = isSafePath(decoded) ? decoded : '';

  return {
    userOrgs,
    onCancelGoto: safeOnCancelGoto,
  };
};

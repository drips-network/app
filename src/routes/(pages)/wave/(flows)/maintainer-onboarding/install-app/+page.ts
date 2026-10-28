import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';
import isSafePath from '$lib/utils/safe-path';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/install-app');
  }

  const userOrgs = await getOrgs(fetch, { limit: 100 });

  // `searchParams.get` already decodes the value.
  const onCancelGoto = url.searchParams.get('onCancelGoto') ?? '';

  // Validate to prevent open redirect attacks
  const safeOnCancelGoto = isSafePath(onCancelGoto) ? onCancelGoto : '';

  return {
    userOrgs,
    onCancelGoto: safeOnCancelGoto,
  };
};

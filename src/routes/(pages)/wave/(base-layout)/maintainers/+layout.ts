import { getOrgs } from '$lib/utils/wave/orgs.js';
import { getPhoneVerificationStatus } from '$lib/utils/wave/users';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // todo(wave): avoid fetching all orgs here
  // we currently do that so that the single issues page can check whether
  // the issue is part of the user's orgs
  const [userOrgs, phoneVerificationStatus] = await Promise.all([
    getOrgs(fetch, { limit: 100 }),
    getPhoneVerificationStatus(fetch),
  ]);

  if (phoneVerificationStatus.status !== 'verified') {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=${encodeURIComponent(url.pathname + url.search)}`,
    );
  }

  const hasOrgs = userOrgs.data.length > 0;

  if (!hasOrgs) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app?onCancelGoto=/wave');
  }

  return {
    hasOrgs,
    userOrgs,
  };
};

import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { getOrgs } from '$lib/utils/wave/orgs.js';
import { getPhoneVerificationRequired } from '$lib/utils/wave/users.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // todo(wave): avoid fetching all orgs here
  // we currently do that so that the single issues page can check whether
  // the issue is part of the user's orgs
  const [userOrgs, phoneVerificationRequired] = await Promise.all([
    getAllPaginated((page, limit) => getOrgs(fetch, { page, limit })),
    getPhoneVerificationRequired(fetch),
  ]);

  if (phoneVerificationRequired?.required && !phoneVerificationRequired.isVerified) {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=${encodeURIComponent(url.pathname + url.search)}`,
    );
  }

  const hasOrgs = userOrgs.length > 0;

  if (!hasOrgs) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app?onCancelGoto=/wave');
  }

  return {
    hasOrgs,
    userOrgs,
  };
};

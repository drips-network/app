import { getGrants } from '$lib/utils/wave/grants.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:rewards');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const [grants, kycStatus] = await Promise.all([
    getGrants(fetch, { page: 1, limit: 100 }),
    getKycStatus(fetch),
  ]);

  return {
    user,
    grants,
    kycStatus,
  };
};

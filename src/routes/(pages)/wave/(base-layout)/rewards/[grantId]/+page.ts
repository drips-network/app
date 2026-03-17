import { getGrant } from '$lib/utils/wave/grants.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, params, depends }) => {
  depends('wave:rewards');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const [grant, kycStatus] = await Promise.all([
    getGrant(fetch, params.grantId),
    getKycStatus(fetch),
  ]);

  if (!grant) {
    throw error(404, 'Grant not found');
  }

  return {
    user,
    grant,
    kycStatus,
  };
};

import { getGrant } from '$lib/utils/wave/grants.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { getKybStatus } from '$lib/utils/wave/kyb.js';
import { handleCheckpointRequired } from '$lib/utils/wave/liveness.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, params, depends }) => {
  depends('wave:rewards');
  depends('wave:liveness-checkpoint');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // Refused only when *this* grant needs a check — an exempt KYB org grant is
  // served as normal. See handleCheckpointRequired.
  const [grant, kycStatus] = await Promise.all([
    getGrant(fetch, params.grantId),
    getKycStatus(fetch),
  ]).catch((err) => handleCheckpointRequired(err, url.pathname + url.search));

  if (!grant) {
    throw error(404, 'Grant not found');
  }

  let kybStatus = null;
  if (grant.isOrgGrant && grant.orgId) {
    try {
      kybStatus = await getKybStatus(fetch, grant.orgId);
    } catch {
      // Fall back to no KYB — user will see the default KYC flow
    }
  }

  return {
    user,
    grant,
    kycStatus,
    kybStatus,
  };
};

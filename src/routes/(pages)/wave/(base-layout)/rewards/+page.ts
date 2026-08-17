import { getGrants } from '$lib/utils/wave/grants.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { getKybStatus, type KybStatus } from '$lib/utils/wave/kyb.js';
import { handleCheckpointRequired } from '$lib/utils/wave/liveness.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:rewards');
  depends('wave:liveness-checkpoint');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // The API gates the grants endpoints on the liveness checkpoint and is the
  // only thing that knows whether this user's grants need one, so we ask by
  // fetching and let the refusal route us.
  const [grants, kycStatus] = await Promise.all([
    getGrants(fetch, { page: 1, limit: 100 }),
    getKycStatus(fetch),
  ]).catch((err) => handleCheckpointRequired(err, url.pathname + url.search));

  // Fetch KYB status for each unique org among org grants
  const orgIds = [
    ...new Set(grants.data.filter((g) => g.isOrgGrant && g.orgId).map((g) => g.orgId!)),
  ];
  const kybEntries = await Promise.all(
    orgIds.map(async (orgId) => {
      try {
        return [orgId, await getKybStatus(fetch, orgId)] as const;
      } catch {
        return null;
      }
    }),
  );
  const kybByOrg: Record<string, KybStatus> = Object.fromEntries(
    kybEntries.filter((e) => e !== null),
  );

  return {
    user,
    grants,
    kycStatus,
    kybByOrg,
  };
};

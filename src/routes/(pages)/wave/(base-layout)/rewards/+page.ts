import { getGrants } from '$lib/utils/wave/grants.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { getKybStatus, type KybStatus } from '$lib/utils/wave/kyb.js';
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

  // Fetch KYB status for each unique org among org grants
  const orgIds = [
    ...new Set(grants.data.filter((g) => g.isOrgGrant && g.orgId).map((g) => g.orgId!)),
  ];
  const kybEntries = await Promise.all(
    orgIds.map(async (orgId) => [orgId, await getKybStatus(fetch, orgId)] as const),
  );
  const kybByOrg: Record<string, KybStatus> = Object.fromEntries(kybEntries);

  return {
    user,
    grants,
    kycStatus,
    kybByOrg,
  };
};

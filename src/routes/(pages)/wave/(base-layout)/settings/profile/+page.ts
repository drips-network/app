import { getLinkedAccounts } from '$lib/utils/wave/discord.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:linked-accounts');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const [kycStatus, linkedAccountsResult] = await Promise.all([
    getKycStatus(fetch),
    getLinkedAccounts(fetch).catch(() => ({ linkedAccounts: [] })),
  ]);

  return {
    user,
    kycStatus,
    linkedAccounts: linkedAccountsResult.linkedAccounts,
  };
};

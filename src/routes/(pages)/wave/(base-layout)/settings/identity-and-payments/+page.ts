import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const kycStatus = await getKycStatus(fetch);

  return {
    user,
    kycStatus,
  };
};

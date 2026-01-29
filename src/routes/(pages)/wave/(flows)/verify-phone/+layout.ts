import { getPhoneVerificationStatus } from '$lib/utils/wave/users.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:phone-verification-status');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/verify-phone');
  }

  const phoneVerificationStatus = await getPhoneVerificationStatus(fetch);

  return {
    phoneVerificationStatus,
  };
};

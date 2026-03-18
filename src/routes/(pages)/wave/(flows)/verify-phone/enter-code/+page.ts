import { safeParseBackToParam } from '$lib/utils/safe-path.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { phoneVerificationStatus } = await parent();

  const backTo = safeParseBackToParam(url);

  if (phoneVerificationStatus.status === 'verified') {
    throw redirect(302, '/wave/verify-phone/success?backTo=' + encodeURIComponent(backTo || ''));
  }

  if (phoneVerificationStatus.status !== 'pending') {
    throw redirect(302, '/wave/verify-phone');
  }

  return {
    phoneVerificationStatus,
    backTo,
  };
};

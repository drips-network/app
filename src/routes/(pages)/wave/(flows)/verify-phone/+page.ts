import { redirect } from '@sveltejs/kit';
import { safeParseBackToParam } from '$lib/utils/safe-path';

export const load = async ({ parent, depends, url }) => {
  depends('wave:phone-verification-status');

  const { phoneVerificationStatus } = await parent();

  const backTo = safeParseBackToParam(url);

  if (phoneVerificationStatus.status === 'verified') {
    throw redirect(302, `/wave/verify-phone/success?backTo=${encodeURIComponent(backTo || '')}`);
  }

  if (phoneVerificationStatus.status !== 'pending' && !phoneVerificationStatus.canRetry) {
    return {
      phoneVerificationStatus,
      error: 'cannot-retry',
    };
  }

  return {
    phoneVerificationStatus,
    backTo,
  };
};

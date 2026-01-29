import { safeParseBackToParam } from '$lib/utils/safe-path.js';
import { redirect } from '@sveltejs/kit';
import { parsePhoneNumber } from 'libphonenumber-js/mobile';

export const load = async ({ parent, url }) => {
  const { phoneVerificationStatus } = await parent();

  const backTo = safeParseBackToParam(url);

  if (phoneVerificationStatus.status === 'verified') {
    throw redirect(302, '/wave/verify-phone/success?backTo=' + encodeURIComponent(backTo || ''));
  }

  if (phoneVerificationStatus.status !== 'pending') {
    throw redirect(302, '/wave/verify-phone');
  }

  const phoneNumberParam = url.searchParams.get('number');

  if (!phoneNumberParam) {
    throw redirect(302, '/wave/verify-phone');
  }

  try {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumberParam);

    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      throw redirect(302, `/wave/verify-phone?backTo=${encodeURIComponent(backTo || '')}`);
    }

    return {
      phoneVerificationStatus,
      phoneNumber: parsedPhoneNumber,
      backTo,
    };
  } catch {
    throw redirect(302, `/wave/verify-phone?backTo=${encodeURIComponent(backTo || '')}`);
  }
};

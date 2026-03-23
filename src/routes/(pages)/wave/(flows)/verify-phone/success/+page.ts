import { safeParseBackToParam } from '$lib/utils/safe-path.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { phoneVerificationStatus } = await parent();

  const backTo = safeParseBackToParam(url);

  if (phoneVerificationStatus.status !== 'verified') {
    throw redirect(302, `/wave/verify-phone?backTo=${encodeURIComponent(backTo)}`);
  }

  return {
    backTo,
  };
};

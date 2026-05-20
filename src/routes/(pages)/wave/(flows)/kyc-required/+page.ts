import isSafePath from '$lib/utils/safe-path';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, fetch }) => {
  const backTo = url.searchParams.get('backTo') || '/wave';
  const decoded = decodeURIComponent(backTo || '');
  const safeBackTo = isSafePath(decoded) ? decoded : '/wave';

  try {
    const kycStatus = await getKycStatus(fetch);
    const isKycVerified =
      kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';

    if (isKycVerified) {
      throw redirect(302, safeBackTo);
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err && err.status === 302) {
      throw err;
    }
    // If not authenticated or other error, redirect to login
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return {
    backTo: safeBackTo,
  };
};

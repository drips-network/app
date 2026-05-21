import { safeParseBackToParam } from '$lib/utils/safe-path';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, fetch }) => {
  const safeBackTo = safeParseBackToParam(url) || '/wave';

  try {
    const kycStatus = await getKycStatus(fetch);
    const isKycVerified =
      kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';
    // RED users have already attempted KYC; the "please verify" pitch on this
    // page is misleading for them. Mirror the login callback's behavior.
    const isKycRejected = kycStatus.reviewAnswer === 'RED';

    if (isKycVerified || isKycRejected) {
      throw redirect(302, safeBackTo);
    }
  } catch (err) {
    // Preserve our own 302 redirect above.
    if (err && typeof err === 'object' && 'status' in err && err.status === 302) {
      throw err;
    }
    // Only auth failures send the user to login. Real outages (5xx, network,
    // parsing) should bubble up so we don't mask them behind a login screen
    // or create redirect loops for already-authenticated users.
    if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
      throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
    }
    throw err;
  }

  return {
    backTo: safeBackTo,
  };
};

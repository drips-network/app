import { getKycStatus, getSumsubSessionToken } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/kyc');
  }

  const kycStatus = await getKycStatus(fetch);

  if (kycStatus.status === 'applicantCreated' || kycStatus.status === 'pending') {
    const sumsubSessionToken = (await getSumsubSessionToken(fetch)).accessToken;

    return {
      user,
      kycStatus,
      waveFullscreenFlow: true,
      sumsubSessionToken,
    };
  } else {
    return {
      user,
      kycStatus,
    };
  }
};

import { getSumsubSessionToken } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/kyc');
  }

  const sumsubTokenRes = await getSumsubSessionToken(fetch);

  return {
    sumsubToken: sumsubTokenRes.accessToken,
    waveFullscreenFlow: true,
  };
};

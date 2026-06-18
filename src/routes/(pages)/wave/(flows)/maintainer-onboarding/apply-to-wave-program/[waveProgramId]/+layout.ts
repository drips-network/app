import { getPhoneVerificationRequired } from '$lib/utils/wave/users.js';
import { getWaveProgram, getWaveProgramApplicationLimits } from '$lib/utils/wave/wavePrograms.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, depends, url }) => {
  depends('wave:maintainer-onboarding-apply-to-wave');

  const [waveProgram, phoneVerificationRequired, applicationLimits] = await Promise.all([
    getWaveProgram(fetch, params.waveProgramId),
    getPhoneVerificationRequired(fetch).catch(() => null),
    getWaveProgramApplicationLimits(fetch, params.waveProgramId),
  ]);

  if (!waveProgram) {
    throw error(404, 'Wave not found');
  }

  if (phoneVerificationRequired?.required && !phoneVerificationRequired.isVerified) {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=${encodeURIComponent(url.pathname + url.search)}`,
    );
  }

  return {
    waveProgram,
    applicationLimits,
  };
};

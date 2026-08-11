import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { getLivenessCheckpointStatus } from '$lib/utils/wave/liveness.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:liveness-checkpoint');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const checkpoint = await getLivenessCheckpointStatus(fetch, 'grant_access');

  // A checkpoint is a Sumsub applicant *action*, which needs an approved KYC to
  // hang off — the API refuses to start one otherwise, so this flow would just
  // dead-end. Identity verification is the actual next step for those users,
  // and passing it satisfies the checkpoint anyway.
  //
  // `backTo` is dropped on purpose: wherever they were headed is gated on the
  // check they can't take yet, so sending them back would bounce them right
  // back here — and for a rejected KYC, `kyc-required` redirects to `backTo`,
  // which would make that an endless loop.
  if (!checkpoint.satisfied) {
    const kycStatus = await getKycStatus(fetch);
    const kycApproved =
      kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';

    if (!kycApproved) {
      throw redirect(302, `/wave/kyc-required?backTo=${encodeURIComponent('/wave')}`);
    }
  }

  return {
    checkpoint,
  };
};

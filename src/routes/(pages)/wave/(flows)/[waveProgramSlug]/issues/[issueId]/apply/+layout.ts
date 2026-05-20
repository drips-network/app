import {
  getApplicationQuota,
  getIssueApplications,
  getOrgAssignmentQuota,
} from '$lib/utils/wave/issues.js';
import { getPhoneVerificationRequired } from '$lib/utils/wave/users.js';
import { getWaves } from '$lib/utils/wave/wavePrograms.js';
import { getKycStatus } from '$lib/utils/wave/kyc.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, parent, url }) => {
  const { user, waveProgram, issue } = await parent();

  const { issueId } = params;

  const [
    waves,
    upcomingWaves,
    applicationQuota,
    orgAssignmentQuota,
    phoneVerificationRequired,
    kycStatus,
  ] = await Promise.all([
    getWaves(
      fetch,
      waveProgram.id,
      {},
      {
        status: 'active',
      },
    ),
    getWaves(
      fetch,
      waveProgram.id,
      { limit: 1 },
      {
        status: 'upcoming',
      },
    ),
    getApplicationQuota(fetch, waveProgram.id).catch(() => null),
    getOrgAssignmentQuota(fetch, waveProgram.id, issue.repo.org.id).catch(() => null),
    getPhoneVerificationRequired(fetch).catch(() => null),
    getKycStatus(fetch).catch(() => null),
  ]);

  const previousApplication = await getIssueApplications(
    fetch,
    waveProgram.id,
    issueId,
    { limit: 1 },
    { applicantId: user.id, statusNot: 'withdrawn' },
  );
  const alreadyApplied = previousApplication.pagination.total > 0;

  if (phoneVerificationRequired?.required && !phoneVerificationRequired.isVerified) {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=${encodeURIComponent(url.pathname + url.search)}`,
    );
  }

  const isKycVerified =
    kycStatus && kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';

  const upcomingWave = upcomingWaves.data[0] ?? null;

  return {
    waves,
    alreadyApplied,
    upcomingWave,
    applicationQuota,
    orgAssignmentQuota,
    isKycVerified,
  };
};

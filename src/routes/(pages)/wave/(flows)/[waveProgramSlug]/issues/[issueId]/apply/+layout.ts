import { getPhoneVerificationStatus } from '$lib/utils/wave/users.js';
import {
  getApplicationQuota,
  getIssueApplications,
  getOrgAssignmentQuota,
} from '$lib/utils/wave/issues.js';
import { getWaves } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, parent }) => {
  const { user, waveProgram, issue } = await parent();

  const { issueId } = params;

  const [waves, upcomingWaves, applicationQuota, orgAssignmentQuota, phoneVerificationStatus] =
    await Promise.all([
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
      getPhoneVerificationStatus(fetch),
    ]);

  if (phoneVerificationStatus.status !== 'verified') {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=/wave/${waveProgram.slug}/issues/${issueId}/apply`,
    );
  }

  const previousApplication = await getIssueApplications(
    fetch,
    waveProgram.id,
    issueId,
    { limit: 1 },
    { applicantId: user.id, statusNot: 'withdrawn' },
  );
  const alreadyApplied = previousApplication.pagination.total > 0;

  const upcomingWave = upcomingWaves.data[0] ?? null;

  return {
    waves,
    alreadyApplied,
    upcomingWave,
    applicationQuota,
    orgAssignmentQuota,
  };
};

import {
  getApplicationQuota,
  getIssueApplications,
  getOrgAssignmentQuota,
} from '$lib/utils/wave/issues.js';
import { getWaves } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ fetch, params, parent }) => {
  const { user, waveProgram, issue } = await parent();

  const { issueId } = params;

  const [waves, upcomingWaves, applicationQuota, orgAssignmentQuota] = await Promise.all([
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
    getApplicationQuota(fetch, waveProgram.id),
    getOrgAssignmentQuota(fetch, waveProgram.id, issue.repo.org.id),
  ]);

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

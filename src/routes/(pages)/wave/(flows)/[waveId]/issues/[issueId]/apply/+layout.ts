import { getIssueApplications } from '$lib/utils/wave/issues.js';
import { getWaveCycles } from '$lib/utils/wave/waves.js';

export const load = async ({ fetch, params, parent }) => {
  const { user } = await parent();

  const { waveId, issueId } = params;

  const [cycles] = await Promise.all([
    getWaveCycles(
      fetch,
      waveId,
      {},
      {
        status: 'active',
      },
    ),
  ]);

  const previousApplication = await getIssueApplications(
    fetch,
    waveId,
    issueId,
    { limit: 1 },
    { applicantId: user.id, statusNot: 'withdrawn' },
  );
  const alreadyApplied = previousApplication.pagination.total > 0;

  return {
    cycles,
    alreadyApplied,
  };
};

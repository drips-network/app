import { getIssueApplications } from '$lib/utils/wave/issues.js';
import { getWaves } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ fetch, params, parent }) => {
  const { user } = await parent();

  const { waveProgramId, issueId } = params;

  const [waves] = await Promise.all([
    getWaves(
      fetch,
      waveProgramId,
      {},
      {
        status: 'active',
      },
    ),
  ]);

  const previousApplication = await getIssueApplications(
    fetch,
    waveProgramId,
    issueId,
    { limit: 1 },
    { applicantId: user.id, statusNot: 'withdrawn' },
  );
  const alreadyApplied = previousApplication.pagination.total > 0;

  return {
    waves,
    alreadyApplied,
  };
};

import { getIssue, getIssueApplications } from '$lib/utils/wave/issues.js';
import { getOrgs } from '$lib/utils/wave/orgs.js';
import { getWave, getWaveCycles } from '$lib/utils/wave/waves.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, params, url }) => {
  const { user } = await parent();

  const { waveId, issueId } = params;

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${url.pathname}${url.search}&skip_welcome=true`);
  }

  const [issue, wave, cycles, ownOrgs] = await Promise.all([
    getIssue(fetch, issueId),
    getWave(fetch, waveId),
    getWaveCycles(
      fetch,
      waveId,
      {},
      {
        status: 'active',
      },
    ),
    getOrgs(fetch, { limit: 100 }),
  ]);

  if (!wave || !issue) {
    throw error(404, 'Wave or Issue not found');
  }

  const previousApplication = await getIssueApplications(
    fetch,
    waveId,
    issueId,
    { limit: 1 },
    { applicantId: user.id },
  );
  const alreadyApplied = previousApplication.pagination.total > 0;

  const isOwnIssue = ownOrgs.data.some((org) => org.org.id === issue.repo.org.id);

  return {
    issue,
    wave,
    cycles,
    alreadyApplied,
    isOwnIssue,
  };
};

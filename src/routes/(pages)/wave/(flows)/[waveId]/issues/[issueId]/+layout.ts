import { getIssue } from '$lib/utils/wave/issues.js';
import { getOrgs } from '$lib/utils/wave/orgs.js';
import { getWave } from '$lib/utils/wave/waves.js';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = async ({ parent, fetch, params, url }) => {
  const { user } = await parent();

  const { waveId, issueId } = params;

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${url.pathname}${url.search}&skip_welcome=true`);
  }

  const [issue, wave, ownOrgs] = await Promise.all([
    getIssue(fetch, issueId),
    getWave(fetch, waveId),
    getOrgs(fetch, { limit: 100 }),
  ]);

  if (!wave || !issue) {
    throw error(404, 'Wave or Issue not found');
  }

  const isOwnIssue = ownOrgs.data.some((org) => org.org.id === issue.repo.org.id);

  return {
    issue,
    wave,
    isOwnIssue,
    user,
  };
};

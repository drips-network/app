import { getIssue } from '$lib/utils/wave/issues.js';
import { getOrgs } from '$lib/utils/wave/orgs.js';
import { getWaveProgram } from '$lib/utils/wave/wavePrograms.js';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = async ({ parent, fetch, params, url }) => {
  const { user } = await parent();

  const { waveProgramId, issueId } = params;

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${url.pathname}${url.search}&skip_welcome=true`);
  }

  const [issue, waveProgram, ownOrgs] = await Promise.all([
    getIssue(fetch, issueId),
    getWaveProgram(fetch, waveProgramId),
    getOrgs(fetch, { limit: 100 }),
  ]);

  if (!waveProgram || !issue) {
    throw error(404, 'Wave Program or Issue not found');
  }

  const isOwnIssue = ownOrgs.data.some((org) => org.org.id === issue.repo.org.id);

  return {
    issue,
    waveProgram,
    isOwnIssue,
    user,
  };
};

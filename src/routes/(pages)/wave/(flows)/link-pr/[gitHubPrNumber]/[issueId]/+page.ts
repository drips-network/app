import { getIssue } from '$lib/utils/wave/issues.js';
import { redirect, error } from '@sveltejs/kit';

export const load = async ({ parent, fetch, params, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${url.pathname}${url.search}&skipWelcome=true`);
  }

  const gitHubPrNumber = Number(params.gitHubPrNumber);

  if (Number.isNaN(gitHubPrNumber)) {
    throw error(400, 'Invalid PR number');
  }

  const issue = await getIssue(fetch, params.issueId);

  if (!issue) {
    throw error(404, 'Issue not found');
  }

  return {
    issue,
    user,
    gitHubPrNumber,
  };
};

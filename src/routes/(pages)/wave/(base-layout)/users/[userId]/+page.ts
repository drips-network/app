import { getIssues } from '$lib/utils/wave/issues.js';
import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import { getUser, getUserOrgs } from '$lib/utils/wave/users.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { userId } = params;

  // Fetch the user first and 404 early. Restricted / banned users are hidden by
  // the backend returning 404 here, so we must not surface data from the sibling
  // endpoints (points, issues, orgs) for them.
  const profileUserData = await getUser(fetch, userId);
  if (!profileUserData) {
    throw error(404, 'User not found');
  }

  const [pointsBalance, resolvedIssues, orgs] = await Promise.all([
    getPointsBalanceForUser(fetch, userId),
    getIssues(fetch, { limit: 50 }, { assignedToUser: userId, state: 'closed' }),
    getUserOrgs(fetch, userId),
  ]);
  if (!pointsBalance) {
    throw error(404, 'User not found');
  }

  return {
    profileUserData,
    pointsBalance,
    resolvedIssues,
    orgs,
  };
};

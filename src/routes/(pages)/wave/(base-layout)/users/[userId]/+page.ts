import { getIssues } from '$lib/utils/wave/issues.js';
import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import { getUser, getUserOrgs } from '$lib/utils/wave/users.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { userId } = params;

  const [profileUserData, pointsBalance, resolvedIssues, orgs] = await Promise.all([
    getUser(fetch, userId),
    getPointsBalanceForUser(fetch, userId),
    getIssues(fetch, { limit: 50 }, { assignedToUser: userId, state: 'closed' }),
    getUserOrgs(fetch, userId),
  ]);
  if (!profileUserData || !pointsBalance) {
    throw error(404, 'User not found');
  }

  return {
    profileUserData,
    pointsBalance,
    resolvedIssues,
    orgs,
  };
};

import { getIssues } from '$lib/utils/wave/issues.js';
import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import { getUser, getUserOrgs } from '$lib/utils/wave/users.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const { userId } = params;

  // Fetch everything in parallel. When the backend won't expose a user it 404s
  // the user-scoped endpoints, so we keep the orgs lookup from rejecting the
  // whole batch and let the user lookup decide the outcome below: no user -> 404
  // (a genuine failure for an existing user still surfaces as an error).
  const [profileUserData, pointsBalance, resolvedIssues, orgs] = await Promise.all([
    getUser(fetch, userId),
    getPointsBalanceForUser(fetch, userId),
    getIssues(fetch, { limit: 50 }, { assignedToUser: userId, state: 'closed' }),
    getUserOrgs(fetch, userId).catch(() => []),
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

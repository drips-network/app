import { getIssues } from '$lib/utils/wave/issues.js';
import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import { getUser, getUserOrgs } from '$lib/utils/wave/users.js';
import { error, redirect } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ params, fetch }) => {
  const { userId } = params;

  // The backend resolves GitHub usernames on /api/users/:id, but the sibling
  // endpoints (points, issues, orgs) are UUID-only and would 400/404 for an
  // existing user. Canonicalize username URLs onto the UUID route first.
  if (!z.uuid().safeParse(userId).success) {
    const user = await getUser(fetch, userId);
    if (!user) throw error(404, 'User not found');
    redirect(307, `/wave/users/${user.id}`);
  }

  // Fetch everything in parallel, deferring failures so the user lookup alone
  // decides the outcome: no user -> 404, anything else -> genuine error.
  const [userRes, pointsRes, issuesRes, orgsRes] = await Promise.allSettled([
    getUser(fetch, userId),
    getPointsBalanceForUser(fetch, userId),
    getIssues(fetch, { limit: 50 }, { assignedToUser: userId, state: 'closed' }),
    getUserOrgs(fetch, userId),
  ]);

  // The user lookup itself failing (network, 5xx) is an error, not a 404.
  if (userRes.status === 'rejected') throw userRes.reason;
  if (!userRes.value) throw error(404, 'User not found');

  // The user exists, so a sibling failure is a genuine error and must surface.
  if (pointsRes.status === 'rejected') throw pointsRes.reason;
  if (issuesRes.status === 'rejected') throw issuesRes.reason;
  if (orgsRes.status === 'rejected') throw orgsRes.reason;

  // Balance only 404s (-> null) when the user doesn't exist, so reaching this
  // with null means the user vanished mid-request; treat it as not found.
  if (!pointsRes.value) throw error(404, 'User not found');

  return {
    profileUserData: userRes.value,
    pointsBalance: pointsRes.value,
    resolvedIssues: issuesRes.value,
    orgs: orgsRes.value,
  };
};

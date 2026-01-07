import { getComplimentCountSummaryForUser } from '$lib/utils/wave/compliments.js';
import { getIssues } from '$lib/utils/wave/issues.js';
import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import { getUser } from '$lib/utils/wave/users.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { userId } = params;

  const [profileUserData, pointsBalance, complimentCountSummary, resolvedIssues] =
    await Promise.all([
      getUser(fetch, userId),
      getPointsBalanceForUser(fetch, userId),
      getComplimentCountSummaryForUser(fetch, userId),
      getIssues(fetch, { limit: 50 }, { assignedToUser: userId, state: 'closed' }),
    ]);
  if (!profileUserData || !pointsBalance || !complimentCountSummary) {
    throw error(404, 'User not found');
  }

  return {
    profileUserData,
    pointsBalance,
    complimentCountSummary,
    resolvedIssues,
  };
};

import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';

export const load = async ({ params, fetch }) => {
  const { waveProgramId } = params;

  const firstThreeLeaderboardEntries = await getLeaderboard(fetch, { waveProgramId }, { limit: 3 });

  return {
    leaderboard: {
      firstThreeEntries: firstThreeLeaderboardEntries.data,
      totalCount: firstThreeLeaderboardEntries.pagination.total,
    },
  };
};

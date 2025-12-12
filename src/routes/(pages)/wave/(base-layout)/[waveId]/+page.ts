import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';

export const load = async ({ params, fetch }) => {
  const { waveId } = params;

  const firstThreeLeaderboardEntries = await getLeaderboard(fetch, { limit: 3 }, { waveId });

  return {
    leaderboard: {
      firstThreeEntries: firstThreeLeaderboardEntries.data,
      totalCount: 32, // firstThreeLeaderboardEntries.pagination.total,
    },
  };
};

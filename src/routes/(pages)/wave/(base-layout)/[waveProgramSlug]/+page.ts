import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';

export const load = async ({ parent, fetch }) => {
  const { waveProgram } = await parent();

  const firstThreeLeaderboardEntries = await getLeaderboard(
    fetch,
    { waveProgramId: waveProgram.id },
    { limit: 3 },
  );

  return {
    leaderboard: {
      firstThreeEntries: firstThreeLeaderboardEntries.data,
      totalCount: firstThreeLeaderboardEntries.pagination.total,
    },
  };
};

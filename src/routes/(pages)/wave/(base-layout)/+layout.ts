import { getIssues } from '$lib/utils/wave/issues.js';
import { getOwnPointsBalance } from '$lib/utils/wave/points.js';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:issues');

  const { user } = await parent();

  const [contributorIssuesCount] = await Promise.all([
    user
      ? (
          await getIssues(
            fetch,
            { limit: 1 },
            {
              isInWaveProgram: true,
              appliedToByUser: user.id,
              appliedToByUserCurrentWave: true,
              state: 'open',
            },
          )
        ).pagination.total
      : null,
  ]);

  return {
    pointsBalance: user ? await getOwnPointsBalance(fetch) : null,
    counts: {
      contributorIssuesCount,
    },
  };
};

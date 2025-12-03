import { getOwnPointsBalance } from '$lib/utils/wave/points.js';

export const load = async ({ parent, fetch }) => {
  const { user } = await parent();

  return {
    pointsBalance: user ? await getOwnPointsBalance(fetch) : null,
  };
};

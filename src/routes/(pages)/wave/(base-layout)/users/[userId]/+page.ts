import { getPointsBalanceForUser } from '$lib/utils/wave/points.js';
import getUser from '$lib/utils/wave/users.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { userId } = params;

  const [profileUserData, pointsBalance] = await Promise.all([
    getUser(fetch, userId),
    getPointsBalanceForUser(fetch, userId),
  ]);
  if (!profileUserData) {
    throw error(404, 'User not found');
  }

  return {
    profileUserData,
    pointsBalance,
  };
};

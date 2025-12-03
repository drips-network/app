import { getOwnPointsHistory } from '$lib/utils/wave/points.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login${encodeURIComponent(url.pathname + url.search)}`);
  }

  // TODO(wave): Pagination
  const pointsHistory = await getOwnPointsHistory(fetch, {
    page: 1,
    limit: 100,
  });

  return {
    user,
    pointsHistory,
  };
};

import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';
import type { LeaderboardFilters } from '$lib/utils/wave/types/leaderboard.js';
import { redirect } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ params, fetch, url, parent }) => {
  const { cycles } = await parent();

  const filterParam = url.searchParams.get('filter');
  const filterParsed = z.enum(['all-time', 'current-cycle']).nullable().safeParse(filterParam);

  if (!filterParsed.success) {
    // redirect to same url without filter param
    const newSearchParams = new URLSearchParams(url.searchParams.toString());
    newSearchParams.delete('filter');

    throw redirect(302, `${url.pathname}?${newSearchParams.toString()}`);
  }

  let currentCycleOnly = false;

  const filters: LeaderboardFilters = { waveId: params.waveId };

  if (filterParsed.data === 'current-cycle') {
    const currentCycle = cycles.data[0];
    if (!currentCycle) {
      throw new Error('No cycles found for wave');
    }

    filters.cycleId = currentCycle?.id;
    currentCycleOnly = true;
  }

  const leaderboard = await getLeaderboard(fetch, { limit: 50 }, filters);

  return {
    leaderboard,
    currentCycleOnly,
  };
};

import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';
import type { LeaderboardFilters } from '$lib/utils/wave/types/leaderboard.js';
import { redirect } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ fetch, url, parent }) => {
  const { waves, waveProgram } = await parent();

  const filterParam = url.searchParams.get('filter');
  const filterParsed = z.enum(['all-time', 'current-wave']).nullable().safeParse(filterParam);

  if (!filterParsed.success) {
    // redirect to same url without filter param
    const newSearchParams = new URLSearchParams(url.searchParams.toString());
    newSearchParams.delete('filter');

    throw redirect(302, `${url.pathname}?${newSearchParams.toString()}`);
  }

  let currentWaveOnly = false;

  const filters: LeaderboardFilters = { waveProgramId: waveProgram.id };

  if (filterParsed.data === 'current-wave') {
    const currentWave = waves.data[0];
    if (!currentWave) {
      // remove the filter param and redirect
      const newSearchParams = new URLSearchParams(url.searchParams.toString());
      newSearchParams.delete('filter');

      throw redirect(302, `${url.pathname}?${newSearchParams.toString()}`);
    }

    filters.waveId = currentWave?.id;
    currentWaveOnly = true;
  }

  const leaderboard = await getLeaderboard(fetch, filters, { limit: 20 });

  return {
    leaderboard,
    currentWaveOnly,
    filters,
  };
};

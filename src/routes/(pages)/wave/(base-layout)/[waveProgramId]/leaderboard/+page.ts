import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';
import type { LeaderboardFilters } from '$lib/utils/wave/types/leaderboard.js';
import { redirect } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ params, fetch, url, parent }) => {
  const { waves } = await parent();

  const filterParam = url.searchParams.get('filter');
  const filterParsed = z.enum(['all-time', 'current-wave']).nullable().safeParse(filterParam);

  if (!filterParsed.success) {
    // redirect to same url without filter param
    const newSearchParams = new URLSearchParams(url.searchParams.toString());
    newSearchParams.delete('filter');

    throw redirect(302, `${url.pathname}?${newSearchParams.toString()}`);
  }

  let currentWaveOnly = false;

  const filters: LeaderboardFilters = { waveProgramId: params.waveProgramId };

  if (filterParsed.data === 'current-wave') {
    const currentWave = waves.data[0];
    if (!currentWave) {
      throw new Error('No Waves found for Wave Program');
    }

    filters.waveId = currentWave?.id;
    currentWaveOnly = true;
  }

  const leaderboard = await getLeaderboard(fetch, filters, { limit: 50 });

  return {
    leaderboard,
    currentWaveOnly,
  };
};

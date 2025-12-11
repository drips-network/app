import type { WaveCycleDto } from '$lib/utils/wave/types/wave.js';
import { getWaveCycles, getWaves } from '$lib/utils/wave/waves';

export const load = async ({ fetch }) => {
  // todo(wave): pagination
  const waves = await getWaves(fetch, { limit: 100 });

  const upcomingCycles: { [waveId: string]: WaveCycleDto | null } = {};

  await Promise.all(
    waves.data.map(async (wave) => {
      const cycles = await getWaveCycles(fetch, wave.id, { limit: 50 });

      if (cycles.data.length > 0) {
        const upcomingCycle = cycles.data.find((cycle) => cycle.status === 'upcoming') ?? null;

        upcomingCycles[wave.id] = upcomingCycle;
      }
    }),
  );

  return {
    waves,
    upcomingCycles,
  };
};

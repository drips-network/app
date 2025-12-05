import type { WaveCycleDto } from '$lib/utils/wave/types/wave.js';
import { getWaveCycles, getWaves } from '$lib/utils/wave/waves';

export const load = async ({ fetch }) => {
  // todo(wave): pagination
  const waves = await getWaves(fetch, { limit: 100 });

  const nextCycles: { [waveId: string]: WaveCycleDto } = {};

  await Promise.all(
    waves.data.map(async (wave) => {
      const cycles = await getWaveCycles(fetch, wave.id, { limit: 1 });

      if (cycles.data.length > 0) {
        nextCycles[wave.id] = cycles.data[0];
      }
    }),
  );

  return {
    waves,
    nextCycles,
  };
};

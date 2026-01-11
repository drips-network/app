import type { WaveDto } from '$lib/utils/wave/types/waveProgram.js';
import { getWavePrograms, getWaves } from '$lib/utils/wave/wavePrograms';

export const load = async ({ fetch }) => {
  // todo(wave): pagination
  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  const upcomingWaves: { [waveProgramId: string]: WaveDto | null } = {};

  await Promise.all(
    wavePrograms.data.map(async (wave) => {
      const waves = await getWaves(fetch, wave.id, { limit: 5 });

      if (waves.data.length > 0) {
        const upcomingWave =
          waves.data.find((wave) => wave.status === 'upcoming' || wave.status === 'active') ?? null;

        upcomingWaves[wave.id] = upcomingWave;
      }
    }),
  );

  return {
    wavePrograms,
    upcomingWaves,
  };
};

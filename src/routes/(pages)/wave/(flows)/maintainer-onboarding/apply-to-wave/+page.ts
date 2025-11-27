import { getWaves } from '$lib/utils/wave/waves.js';

export const load = async ({ fetch }) => {
  const waves = await getWaves(fetch, { limit: 100 });

  return {
    waves,
  };
};

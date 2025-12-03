import { getWaves } from '$lib/utils/wave/waves';

export const load = async ({ fetch }) => {
  const waves = await getWaves(fetch, { limit: 10 });

  return {
    waves,
  };
};

import { getRounds } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ fetch, parent }) => {
  const { rpgfUserData } = await parent();

  return {
    own: rpgfUserData ? await getRounds(fetch, true) : null,
    rounds: await getRounds(fetch),
  };
};

export const ssr = false;

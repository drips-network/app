import { getDrafts, getRounds } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ fetch, parent }) => {
  const { rpgfUserData } = await parent();

  return {
    drafts: rpgfUserData ? await getDrafts(fetch) : [],
    rounds: await getRounds(fetch),
  };
};

export const ssr = false;

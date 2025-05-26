import { rpgfJwtStore } from '$lib/utils/rpgf/siwe.js';
import { get } from 'svelte/store';
import { getDrafts, getRounds } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ fetch }) => {
  if (!get(rpgfJwtStore)) {
    return {
      drafts: [],
    };
  }

  return {
    drafts: await getDrafts(fetch),
    rounds: await getRounds(fetch),
  };
};

export const ssr = false;

import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url: { pathname } }) => {
  return { pathname };
};

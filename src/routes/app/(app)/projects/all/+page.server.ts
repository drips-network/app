// import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {
    hello: 'world',
  };
}) satisfies PageServerLoad;

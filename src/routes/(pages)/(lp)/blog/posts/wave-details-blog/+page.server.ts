import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  throw redirect(301, '/blog/posts/drips-wave-whats-launching-in-january');
};

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
  const url = new URL(decodeURI(params.url));

  if (url.protocol.includes('javascript')) {
    throw error(404);
  }

  return {
    url,
  };
}) satisfies PageLoad;

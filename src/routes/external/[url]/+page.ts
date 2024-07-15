import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export const load = (({ params }) => {
  const url = new URL(decodeURI(params.url));

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    error(400, 'Invalid protocol');
  }

  return {
    url,
  };
}) satisfies PageLoad;

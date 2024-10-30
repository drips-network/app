import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export const load = (({ params }) => {
  let url: URL;

  try {
    url = new URL(decodeURI(params.url));
  } catch {
    error(400, 'Invalid URL');
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    error(400, 'Invalid protocol');
  }

  return {
    url,
  };
}) satisfies PageLoad;

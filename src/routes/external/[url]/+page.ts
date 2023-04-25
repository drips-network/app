import type { PageLoad } from './$types';

export const load = (({ params }) => {
  const url = new URL(decodeURI(params.url));

  return {
    url,
  };
}) satisfies PageLoad;

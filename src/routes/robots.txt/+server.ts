import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const allowIndexing = env.PUBLIC_ALLOW_INDEXING === 'true';

  const content = allowIndexing
    ? `User-agent: *
Allow: /
Disallow: /external/*
`
    : `User-agent: *
Disallow: /
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};

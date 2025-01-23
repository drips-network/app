import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private.js';
import stripTrailingSlash from '$lib/utils/strip-trailing-slash.js';
import { error } from '@sveltejs/kit';

const MEILISEARCH_HOST = getOptionalEnvVar('MEILISEARCH_HOST', true, "Search won't work.");
const MEILISEARCH_API_KEY = getOptionalEnvVar('MEILISEARCH_API_KEY', true, "Search won't work.");

export const POST = async ({ request, url }) => {
  const path = url.pathname.replace('/api/search/', '');

  if (!MEILISEARCH_HOST) return error(500, 'MEILISEARCH_HOST env var is required for search');

  const result = await fetch(`${stripTrailingSlash(MEILISEARCH_HOST)}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(await request.json()),
  });

  const resData = await result.text();

  return new Response(resData, {
    status: result.status,
    statusText: result.statusText,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private.js';
import stripTrailingSlash from '$lib/utils/strip-trailing-slash.js';
import { error } from '@sveltejs/kit';
import { isAllowedMultiSearchBody, isAllowedPath } from './validate-search-request';

const MEILISEARCH_HOST = getOptionalEnvVar('MEILISEARCH_HOST', true, "Search won't work.");
const MEILISEARCH_API_KEY = getOptionalEnvVar('MEILISEARCH_API_KEY', true, "Search won't work.");

export const POST = async ({ request, url }) => {
  // Only proxy the endpoint the search bar uses, never admin endpoints like `keys` or `indexes/*`.
  if (!isAllowedPath(url.pathname)) return error(404, 'Not found');

  if (!MEILISEARCH_HOST) return error(500, 'MEILISEARCH_HOST env var is required for search');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, 'Invalid JSON body');
  }

  if (!isAllowedMultiSearchBody(body)) return error(400, 'Invalid search request');

  const result = await fetch(`${stripTrailingSlash(MEILISEARCH_HOST)}/multi-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(body),
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

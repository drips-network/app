import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const PROJECT_CLAIM_API_URL = getOptionalEnvVar(
  'PROJECT_CLAIM_API_URL',
  true,
  'Lit-based owner updates will not work without this.',
);

export const POST: RequestHandler = async ({ request }) => {
  if (!PROJECT_CLAIM_API_URL) {
    return error(503, 'Project claim API is not configured.');
  }

  const body = await request.text();

  const res = await fetch(`${PROJECT_CLAIM_API_URL}/owner-signature`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });

  const responseBody = await res.text();

  return new Response(responseBody, {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
};

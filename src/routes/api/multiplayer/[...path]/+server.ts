import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import stripTrailingSlash from '$lib/utils/strip-trailing-slash';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const missingEnvVarError =
  "The Drip Lists page and any other place that needs to interact with Collaborative Drip Lists won't work.";

const MULTIPLAYER_API_ACCESS_TOKEN = getOptionalEnvVar(
  'MULTIPLAYER_API_ACCESS_TOKEN',
  true,
  missingEnvVarError,
);
const MULTIPLAYER_API_URL = getOptionalEnvVar('MULTIPLAYER_API_URL', true, missingEnvVarError);

/** Proxies all requests to multiplayer server and injects api access token */
export const fallback: RequestHandler = async ({ request, params, url, fetch }) => {
  if (!MULTIPLAYER_API_ACCESS_TOKEN || !MULTIPLAYER_API_URL) {
    return error(500, 'Missing env vars for multiplayer API');
  }

  const body = await request.text();

  const searchParams = url.searchParams.toString();

  const response = await fetch(
    `${stripTrailingSlash(MULTIPLAYER_API_URL)}/${params.path}?${searchParams}`,
    {
      method: request.method,
      body: body || undefined,
      headers: {
        Authorization: `Bearer ${MULTIPLAYER_API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const resBody = (await response.text()) || undefined;

  return new Response(resBody, {
    status: response.status,
  });
};

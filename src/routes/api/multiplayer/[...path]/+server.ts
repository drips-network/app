import { MULTIPLAYER_API_ACCESS_TOKEN, MULTIPLAYER_API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

/** Proxies all requests to multiplayer server and injects api access token */
export const fallback: RequestHandler = async ({ request, params, url, fetch }) => {
  const body = await request.text();

  const searchParams = url.searchParams.toString();

  const response = await fetch(`${MULTIPLAYER_API_URL}/${params.path}?${searchParams}`, {
    method: request.method,
    body: body || undefined,
    headers: {
      Authorization: `Bearer ${MULTIPLAYER_API_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
};

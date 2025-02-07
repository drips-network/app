import { ECOSYSTEM_API_URL, ECOSYSTEM_API_ACCESS_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

/** Proxies all requests to ecosystems server and injects api access token */
export const fallback: RequestHandler = async ({ request, params, url, fetch }) => {
  const body = await request.text();

  const searchParams = url.searchParams.toString();

  const response = await fetch(`${ECOSYSTEM_API_URL}/${params.path}?${searchParams}`, {
    method: request.method,
    body: body || undefined,
    headers: {
      Authorization: `Bearer ${ECOSYSTEM_API_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const resBody = (await response.text()) || undefined;

  return new Response(resBody, {
    status: response.status,
  });
};

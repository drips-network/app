import type { RequestHandler } from './$types';
import { INFURA_KEY } from '$env/static/private';

/** Proxies all requests to Infura and injects api access token */
export const fallback: RequestHandler = async ({ request, params, fetch }) => {
  const body = await request.text();

  const response = await fetch(`https://${params.network}.infura.io/v3/${INFURA_KEY}`, {
    method: request.method,
    body: body || undefined,
  });

  return response;
};

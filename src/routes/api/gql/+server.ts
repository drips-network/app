import type { RequestEvent, RequestHandler } from './$types';
import { GQL_ACCESS_TOKEN, GQL_URL } from '$env/static/private';

function fetchFromGQLEndpoint(body: string) {
  return fetch(GQL_URL, {
    method: 'POST',
    headers: [
      ['Authorization', `Bearer ${GQL_ACCESS_TOKEN}`],
      ['Content-Type', 'application/json'],
    ],
    body,
  });
}

// Proxies requests to the Drips GraphQL API, adding the Authorization header.
export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  const body = await request.text();

  const res = await fetchFromGQLEndpoint(body);

  return new Response(await res.text(), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

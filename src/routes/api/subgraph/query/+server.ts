import type { RequestEvent, RequestHandler } from './$types';
import { SUBGRAPH_URL } from '$env/static/private';

function fetchFromGQLEndpoint(body: string) {
  return fetch(SUBGRAPH_URL, {
    method: 'POST',
    body,
  });
}

// Proxies requests to the Drips Decentralized Subgraph
export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  const body = await request.text();

  const res = await fetchFromGQLEndpoint(body);

  return new Response(res.body);
};

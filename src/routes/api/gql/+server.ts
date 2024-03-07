import type { RequestEvent, RequestHandler } from './$types';
import { GQL_ACCESS_TOKEN, GQL_URL } from '$env/static/private';
import { getRedis } from '../redis';
import { env } from '$env/dynamic/private';
import * as crypto from 'crypto';

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

  const cacheEnabled = request.headers.get('X-Cache') === 'Yes';

  if (cacheEnabled && env.CACHE_REDIS_CONNECTION_STRING) {
    const redis = await getRedis();

    const serializedQuery = JSON.stringify(body);
    const hash = crypto.createHash('sha256').update(serializedQuery).digest('hex');

    const cached = await redis.get(`gql-${hash}`);

    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json', // Assuming JSON response
        },
      });
    } else {
      const response = await fetchFromGQLEndpoint(body);
      const responseData = await response.clone().text();

      if (response.ok) {
        await redis.set(`gql-${hash}`, responseData, { EX: 86400 });
      }

      return response;
    }
  }

  return await fetchFromGQLEndpoint(body);
};

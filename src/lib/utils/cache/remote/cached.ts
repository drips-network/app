import network from '$lib/stores/wallet/network';
import type { RedisClientType } from '../../../../routes/api/redis';

const ENABLE_CACHE_LOGS = true;

function log(...content: unknown[]) {
  if (ENABLE_CACHE_LOGS) {
    // eslint-disable-next-line no-console
    console.log(...content);
  }
}

/**
 * Caches the result of a fetcher function using Redis.
 * @param redis - The Redis instance. If undefined, caching is disabled.
 * @param key - The cache key.
 * @param schema - The Zod schema.
 * @param EX - The expiration time in seconds.
 * @param fetcher - The fetcher function.
 * @returns The result, either cached or freshly fetched.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function cached<T extends Record<string, any>>(
  redis: RedisClientType | undefined,
  key: string,
  EX: number,
  fetcher: () => Promise<T>,
) {
  const keyWithNetwork = `${network.name}-${key}`;

  const cachedResponse = redis && (await redis.get(keyWithNetwork));

  if (cachedResponse) {
    log('CACHE HIT', { keyWithNetwork });

    return JSON.parse(cachedResponse) as Awaited<ReturnType<typeof fetcher>>;
  } else {
    log('CACHE MISS', { keyWithNetwork });

    const data = await fetcher();

    redis?.set(keyWithNetwork, JSON.stringify(data), {
      EX,
    });

    return data;
  }
}

import network from '$lib/stores/wallet/network';
import type { RedisClientType } from '../../../../routes/api/redis';

const ENABLE_CACHE_LOGS = true;

// A cache read should take single-digit milliseconds. If it takes longer the
// connection is likely degraded (e.g. a half-open socket after an idle drop), so
// we give up and serve fresh data rather than block the request. A stalled read
// once hung explore + project SSR for over a minute and took a deployment down.
const READ_TIMEOUT_MS = 1000;

function log(...content: unknown[]) {
  if (ENABLE_CACHE_LOGS) {
    // eslint-disable-next-line no-console
    console.log(...content);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`redis read timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Caches the result of a fetcher function using Redis.
 *
 * The cache read is bounded by a short timeout and never throws: if Redis is
 * slow or unreachable the fetcher runs instead, so a degraded cache slows
 * requests down rather than breaking them.
 *
 * @param redis - The Redis instance. If undefined, caching is disabled.
 * @param key - The cache key.
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

  let cachedResponse: string | null = null;
  if (redis) {
    try {
      cachedResponse = await withTimeout(redis.get(keyWithNetwork), READ_TIMEOUT_MS);
    } catch (err) {
      // Degraded cache — fall through to the fetcher rather than blocking.
      log('CACHE READ FAILED', { keyWithNetwork, error: (err as Error).message });
    }
  }

  if (cachedResponse) {
    log('CACHE HIT', { keyWithNetwork });

    return JSON.parse(cachedResponse) as Awaited<ReturnType<typeof fetcher>>;
  } else {
    log('CACHE MISS', { keyWithNetwork });

    const data = await fetcher();

    redis?.set(keyWithNetwork, JSON.stringify(data), { EX })?.catch((err) => {
      log('CACHE WRITE FAILED', { keyWithNetwork, error: (err as Error).message });
    });

    return data;
  }
}

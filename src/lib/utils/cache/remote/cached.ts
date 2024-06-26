import type { RedisClientType } from '../../../../routes/api/redis';

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
  const cachedResponse = redis && (await redis.get(key));

  if (cachedResponse) {
    console.log('HIT', key)
    return JSON.parse(cachedResponse) as Awaited<ReturnType<typeof fetcher>>;
  } else {
    console.log('MISS', key)

    const data = await fetcher();

    await redis?.set(key, JSON.stringify(data), {
      EX,
    });
    return data;
  }
}

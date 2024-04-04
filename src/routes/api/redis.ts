import redisSdk from 'redis';
import { env } from '$env/dynamic/private';

export const redis = env.CACHE_REDIS_CONNECTION_STRING
  ? redisSdk.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING })
  : undefined;
export type RedisClientType = typeof redis;

redis?.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

await redis?.connect();

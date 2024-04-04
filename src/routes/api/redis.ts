import redis from 'redis';
import { env } from '$env/dynamic/private';

export const getRedis = async () => {
  const client = redis.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING });

  await client.connect();

  return client;
};

import redis from 'redis';
import { env } from '$env/dynamic/private';

export const getRedis = async () => {
  const client = redis.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING });

  client.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });

  await client.connect();

  return client;
};

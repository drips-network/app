import redis from 'redis';
import { env } from '$env/dynamic/private';

export const client = redis.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING });

client.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

await client.connect();

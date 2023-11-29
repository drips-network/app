import redis from 'redis';
import { env } from '$env/dynamic/private';

const client = redis.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING });
client.on('error', function (err) {
  // eslint-disable-next-line no-console
  console.error('Redis error:', err);
});

(async () => {
  try {
    await client.connect();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
})();

export const getRedis = async () => {
  try {
    await client.ping();

    return client;
  } catch (e) {
    await new Promise((resolve) => {
      client.once('ready', resolve);
    });

    return client;
  }
};

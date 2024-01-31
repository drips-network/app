import redis, { type RedisClientType } from 'redis';
import { env } from '$env/dynamic/private';
import assert from '$lib/utils/assert';

let client: RedisClientType | undefined;

if (env.CACHE_REDIS_CONNECTION_STRING) {
  client = redis.createClient({ url: env.CACHE_REDIS_CONNECTION_STRING });

  (async () => {
    try {
      await client.connect();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  })();
}

export const getRedis = async () => {
  assert(client);

  try {
    await client.ping();

    return client;
  } catch (e) {
    await new Promise((resolve) => {
      assert(client);

      client.once('ready', resolve);
    });

    return client;
  }
};

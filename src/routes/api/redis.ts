import redisSdk from 'redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const connectionString = getOptionalEnvVar('CACHE_REDIS_CONNECTION_STRING');

export const redis = connectionString
  ? redisSdk.createClient({ url: connectionString })
  : undefined;
export type RedisClientType = typeof redis;

redis?.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

await redis?.connect();

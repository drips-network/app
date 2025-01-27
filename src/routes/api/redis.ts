import redisSdk from 'redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const connectionString = getOptionalEnvVar(
  'CACHE_REDIS_CONNECTION_STRING',
  true,
  'Caching of project pages, GitHub API calls, and more is disabled.' +
    'You may want to run a local Redis instance and set the env var to avoid GitHub rate limiting during development.',
);

export const redis = connectionString
  ? redisSdk.createClient({ url: connectionString })
  : undefined;
export type RedisClientType = typeof redis;

redis?.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

await redis?.connect();

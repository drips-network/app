import redisSdk from 'redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { building } from '$app/environment';

const connectionString = getOptionalEnvVar(
  'CACHE_REDIS_CONNECTION_STRING',
  true,
  'Caching of project pages, GitHub API calls, and more is disabled.' +
    'You may want to run a local Redis instance and set the env var to avoid GitHub rate limiting during development.',
);

export const redis =
  connectionString && !building
    ? redisSdk.createClient({
        url: connectionString,
        // Proactively PING on an idle interval so a dropped or half-open socket
        // is detected and reconnected. Railway closes idle internal TCP
        // connections; without this, a low-traffic instance can keep sending
        // commands into a dead socket that never replies, hanging every cache
        // read for tens of seconds (the 2026-06-28 Filecoin app outage).
        pingInterval: 10000,
      })
    : undefined;
export type RedisClientType = typeof redis;

redis?.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

await redis?.connect();

import type { PageServerLoad } from './$types';
import cached from '$lib/utils/cache/remote/cached';
import { redis } from '../../../../../api/redis';
import * as ecosystemsApi from '$lib/utils/ecosystems';

async function fetchEcosystem(ecosystemId: string, fetch: typeof global.fetch) {
  const cacheKey = `ecosystem-page:${ecosystemId}`;

  return cached(redis, cacheKey, 172800, () => {
    return ecosystemsApi.get(ecosystemId, fetch);
  });
}

export const load = (async ({ params, fetch }) => {
  const ecosystem = await fetchEcosystem(params.ecosystemId, fetch);

  return {
    ecosystem,
  };
}) satisfies PageServerLoad;

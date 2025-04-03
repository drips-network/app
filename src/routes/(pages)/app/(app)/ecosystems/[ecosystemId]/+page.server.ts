import type { PageServerLoad } from './$types';
// import cached from '$lib/utils/cache/remote/cached';
// import { redis } from '../../../../../api/redis';
import * as ecosystemsApi from '$lib/utils/ecosystems';

async function fetchEcosystem(ecosystemId: string, fetch: typeof global.fetch) {
  // TODO: caching?
  // const cacheKey = `ecosystem-page:${ecosystemId}`;

  // return cached(redis, cacheKey, 1, () => {
  //   return ecosystemsApi.get(ecosystemId, fetch);
  // });
  return ecosystemsApi.get(ecosystemId, fetch);
}

export const load = (async ({ params, fetch }) => {
  const ecosystem = await fetchEcosystem(params.ecosystemId, fetch);
  // console.log(ecosystem.state)
  // if (ecosystem.state !== 'deployed') {
  //   await ecosystemsApi.deploy(String(ecosystem.id), {
  //     chainId: '11155111',
  //     ownerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  //   }, fetch)
  // }

  return {
    ecosystem,
  };
}) satisfies PageServerLoad;

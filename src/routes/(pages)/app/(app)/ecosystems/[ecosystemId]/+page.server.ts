import type { PageServerLoad } from './$types';
import * as ecosystemsApi from '$lib/utils/ecosystems';
import { error } from '@sveltejs/kit';
import { fetchEcosystem } from './fetch-ecosystem';

export const load = (async ({ params, fetch }) => {
  const ecosystem = await ecosystemsApi.get(params.ecosystemId, fetch);
  let ecosystemFragment = undefined;
  if (ecosystem.accountId) {
    const ecosystemRes = await fetchEcosystem(ecosystem.accountId, fetch);
    ecosystemFragment = ecosystemRes.ecosystemMainAccount;
    if (!ecosystemFragment) {
      throw error(404);
    }
  }

  return {
    ecosystem,
    ecosystemFragment,
  };
}) satisfies PageServerLoad;

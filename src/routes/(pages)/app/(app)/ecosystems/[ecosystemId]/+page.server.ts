import type { PageServerLoad } from './$types';
import * as ecosystemsApi from '$lib/utils/ecosystems';
import { fetchEcosystem } from './fetch-ecosystem';

export const load = (async ({ params, fetch }) => {
  const ecosystem = await ecosystemsApi.get(params.ecosystemId, fetch);
  // no problem if no chain data, display the undeployed ecosystem
  let ecosystemChainData = undefined;
  if (ecosystem.accountId) {
    const ecosystemRes = await fetchEcosystem(ecosystem.accountId, fetch);
    ecosystemChainData = ecosystemRes.ecosystemMainAccount || undefined;
  }

  return {
    ecosystem,
    ecosystemChainData,
  };
}) satisfies PageServerLoad;

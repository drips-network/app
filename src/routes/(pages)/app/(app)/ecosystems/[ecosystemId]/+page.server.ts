import type { PageServerLoad } from './$types';
import { fetchEcosystem, fetchEcosystemChainData } from './fetch-ecosystem';

export const load = (async ({ params, fetch }) => {
  const ecosystem = await fetchEcosystem(params.ecosystemId, fetch);
  // no problem if no chain data, display the undeployed ecosystem
  let ecosystemChainData = undefined;
  if (ecosystem.accountId) {
    const ecosystemRes = await fetchEcosystemChainData(ecosystem.accountId, fetch);
    ecosystemChainData = ecosystemRes.ecosystemMainAccount || undefined;
  }

  return {
    ecosystem,
    ecosystemChainData,
  };
}) satisfies PageServerLoad;

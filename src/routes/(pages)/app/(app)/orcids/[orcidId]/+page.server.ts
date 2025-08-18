import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidChainData, orcidIdToAccountId } from './components/fetch-orcid';

export const load = (async ({ params, fetch }) => {
  // TODO: allow fetching of account id or orcid!
  // if it's an actual orcId, then calc the account id here
  // if it's an account id, well...

  const orcid = await fetchOrcid(params.orcidId, fetch);

  const accountId = await orcidIdToAccountId(params.orcidId);
  const orcidChainData = await fetchOrcidChainData(accountId, fetch);

  return {
    orcid,
    orcidChainData,
  };
}) satisfies PageServerLoad;

import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidChainData, orcidIdToAccountId } from './components/fetch-orcid';

export const load = (async ({ params, fetch }) => {
  // TODO: allow fetching of account id or orcid!
  // if it's an actual orcId, then calc the account id here
  // if it's an account id, well...

  if (!isValidOrcidId(params.orcidId)) {
    return error(404);
  }

  const orcid = await fetchOrcid(params.orcidId, fetch);
  if (!orcid) {
    return error(404);
  }

  const accountId = await orcidIdToAccountId(params.orcidId);
  const orcidChainData = await fetchOrcidChainData(String(accountId), fetch);

  return {
    orcid,
    orcidChainData,
  };
}) satisfies PageServerLoad;

// 0009-0007-5482-8654 me in prod
// 0009-0007-1106-8413 drips.network in sandbox

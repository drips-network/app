import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidChainData } from './components/fetch-orcid';

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

  // TODO: I think there's a problem here, I thought we were supposed to fetch the orcid
  // by accountId... We will probably want to support urls that include accountid as well.
  // const accountId = await orcidIdToAccountId(params.orcidId);
  let orcidChainData = undefined;
  const orcidGqlResponse = await fetchOrcidChainData(params.orcidId, fetch);
  if (orcidGqlResponse.orcidAccountById) {
    orcidChainData = orcidGqlResponse.orcidAccountById;
  }

  return {
    orcid,
    orcidChainData,
  };
}) satisfies PageServerLoad;

// 0009-0007-5482-8654 me in prod
// 0009-0007-1106-8413 drips.network in sandbox

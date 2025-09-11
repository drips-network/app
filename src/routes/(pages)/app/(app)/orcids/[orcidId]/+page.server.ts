import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidAccount, orcidIdToAccountId } from './components/fetch-orcid';
import network from '$lib/stores/wallet/network';
import type { OrcidProfileFragment } from './components/__generated__/gql.generated';

/**
 * 0009-0007-5482-8654 me in ORCID prod
 * 0009-0007-1106-8413 drips.network in ORCID sandbox
 */
export const load = (async ({ params, fetch }) => {
  if (!isValidOrcidId(params.orcidId)) {
    return error(404);
  }

  const orcid = await fetchOrcid(params.orcidId, fetch);
  if (!orcid) {
    return error(404);
  }

  // TODO: I think there's a problem here, I thought we were supposed to fetch the orcid
  // by accountId... We will probably want to support urls that include accountid as well.
  let orcidAccount = undefined;
  const orcidGqlResponse = await fetchOrcidAccount(params.orcidId, fetch);
  if (orcidGqlResponse.orcidLinkedIdentityByOrcid) {
    orcidAccount = orcidGqlResponse.orcidLinkedIdentityByOrcid;
  }

  if (!orcidAccount) {
    const accountId = await orcidIdToAccountId(params.orcidId);
    orcidAccount = {
      __typename: 'OrcidLinkedIdentity',
      account: {
        __typename: 'RepoDriverAccount',
        accountId: String(accountId),
        driver: 'REPO' as const,
      },
      orcid: orcid.id,
      isClaimed: false,
      isLinked: false
    } as OrcidProfileFragment;
  }

  return {
    orcid: orcid.toJSON(),
    orcidAccount,
  };
}) satisfies PageServerLoad;

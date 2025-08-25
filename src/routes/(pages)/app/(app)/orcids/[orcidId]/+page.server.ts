import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidAccount, orcidIdToAccountId } from './components/fetch-orcid';
import network from '$lib/stores/wallet/network';
import type { OrcidProfileFragment } from './components/__generated__/gql.generated';

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
  if (orcidGqlResponse.orcidAccountById) {
    orcidAccount = orcidGqlResponse.orcidAccountById;
  }

  if (!orcidAccount) {
    const accountId = await orcidIdToAccountId(params.orcidId);
    orcidAccount = {
      __typename: 'OrcidAccount',
      account: {
        __typename: 'RepoDriverAccount',
        accountId: String(accountId),
        driver: 'REPO' as const,
      },
      source: { __typename: 'OrcidSource', url: orcid.url },
      chainData: [
        {
          chain: network.gqlName,
          __typename: 'UnClaimedOrcidAccountData',
          linkedTo: null,
          support: [],
          withdrawableBalances: [],
        },
      ],
    } as OrcidProfileFragment;
  }

  return {
    orcid,
    orcidAccount,
  };
}) satisfies PageServerLoad;

// 0009-0007-5482-8654 me in prod
// 0009-0007-1106-8413 drips.network in sandbox

import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
  fetchOrcid,
  fetchOrcidAccount,
  orcidIdToAccountId,
} from '../../../../../../lib/utils/orcids/fetch-orcid';
import type { OrcidProfileFragment } from './components/__generated__/gql.generated';

export const load = (async ({ params, fetch }) => {
  if (!isValidOrcidId(params.orcidId)) {
    return error(404);
  }

  const orcid = await fetchOrcid(params.orcidId, fetch);
  if (!orcid) {
    return error(404);
  }

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
      areSplitsValid: false,
    } as OrcidProfileFragment;
  }

  return {
    orcid: orcid.toJSON(),
    orcidAccount,
  };
}) satisfies PageServerLoad;

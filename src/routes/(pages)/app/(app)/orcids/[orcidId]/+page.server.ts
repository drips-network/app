import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrcid, fetchOrcidAccount } from '../../../../../../lib/utils/orcids/fetch-orcid';
import Orcid from '$lib/utils/orcids/entities';
import isValidOrcidId from '$lib/utils/orcids/is-valid-orcid-id';

/**
 * 0009-0007-5482-8654 me in ORCID prod
 * 0009-0007-1106-8413 drips.network in ORCID sandbox
 */
export const load = (async ({ params, fetch }) => {
  if (!isValidOrcidId(params.orcidId)) {
    return error(400, 'Invalid ORCID iD');
  }

  const orcidGqlResponse = await fetchOrcidAccount(params.orcidId, fetch);
  const orcidAccount = orcidGqlResponse.orcidLinkedIdentityByOrcid;
  // If the backend can't get the ORCID info, then something is deeply wrong
  // and we cannot proceed
  if (!orcidAccount) {
    return error(404);
  }

  // If the frontend can't the ORCID info, then there might be a rate
  // limiting issue or an API authroization issue. Fake it till you make it.
  let orcid = await fetchOrcid(params.orcidId, fetch);
  if (!orcid) {
    orcid = new Orcid({
      'orcid-identifier': {
        uri: `https://orcid.org/${params.orcidId}`,
        path: params.orcidId,
        host: 'orcid.org',
      },
      person: {
        'last-modified-date': null,
        name: {
          'given-names': null,
          'family-name': null,
          'credit-name': null,
        },
        biography: null,
        'researcher-urls': null,
        'other-names': null,
      },
    });
  }

  return {
    orcid: orcid.toJSON(),
    orcidAccount,
  };
}) satisfies PageServerLoad;

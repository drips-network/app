import { gql } from 'graphql-request';
import { ORCID_PROFILE_FRAGMENT } from '../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/orcid-profile-fragments';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { OrcidApiResponseSchema } from '$lib/utils/orcids/schemas';
import Orcid from '$lib/utils/orcids/entities';
import assert from '$lib/utils/assert';
import type {
  OrcidByAccountIdQuery,
  OrcidByAccountIdQueryVariables,
} from './__generated__/gql.generated';

const PUBLIC_ORCID_API_URL = getOptionalEnvVar(
  'PUBLIC_ORCID_API_URL',
  network.orcids,
  'PUBLIC_ORCID_API_URL is required when orcids are enabled on the current network',
);

export function orcidIdToAccountId(orcidId: string) {
  return executeRepoDriverReadMethod({
    functionName: 'calcAccountId',
    args: [Forge.orcidId, hexlify(toUtf8Bytes(orcidId)) as OxString],
  });
}

/**
 * Fetch ORCID profile from the ORCID public API. Subject to anonymous usage limits:
 * - 12 req/sec
 * - 40 burst/sec
 * - 25,000 reads/day (Per IP address)
 *
 * @param orcidId The ORCID iD of the profile to fetch.
 * @param fetch A fetch function
 * @returns A Orcid instance or null if not found or on error.
 */
export async function fetchOrcid(orcidId: string, fetch: typeof global.fetch) {
  assert(PUBLIC_ORCID_API_URL, 'PUBLIC_ORCID_API_URL is required to fetch ORCID profiles');
  const orcidResponse = await fetch(`${PUBLIC_ORCID_API_URL}/v3.0/${orcidId}/record`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!orcidResponse.ok) {
    // eslint-disable-next-line no-console
    console.error('ORCID API returned non-ok response', await orcidResponse.text());
    return null;
  }

  const responseJson = await orcidResponse.json();
  const orcid = OrcidApiResponseSchema.parse(responseJson);

  return new Orcid(orcid);
}

const getOrcidQuery = gql`
  ${ORCID_PROFILE_FRAGMENT}
  query OrcidByAccountId($orcid: String!, $chain: SupportedChain!) {
    orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
      ...OrcidProfile
    }
  }
`;

export async function fetchOrcidAccount(accountId: string, fetch?: typeof global.fetch) {
  return query<OrcidByAccountIdQuery, OrcidByAccountIdQueryVariables>(
    getOrcidQuery,
    {
      orcid: accountId,
      chain: network.gqlName,
    },
    fetch,
  );
}

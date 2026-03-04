import { gql } from 'graphql-request';
import { ORCID_PROFILE_FRAGMENT } from '../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/orcid-profile-fragments';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';
import { PUBLIC_ORCID_API_URL } from '$env/static/public';
import { OrcidApiResponseSchema } from '$lib/utils/orcids/schemas';
import Orcid from '$lib/utils/orcids/entities';
import type {
  OrcidByAccountIdQuery,
  OrcidByAccountIdQueryVariables,
} from './__generated__/gql.generated';

const ORCID_SANDBOX_PREFIX = 'sandbox-';

/**
 * Determine if the ORCID API url is pointing to the sandbox environment.
 *
 * @returns true if the ORCID API url is pointing to the sandbox, false otherwise.
 */
export function isSandboxOrcidEnv() {
  try {
    const url = new URL(PUBLIC_ORCID_API_URL);
    return url.host === 'pub.sandbox.orcid.org';
  } catch {
    return false;
  }
}

/**
 * Prefixes an ORCID iD with 'sandbox-' if using the sandbox API. Necessary
 * for calls to requestUpdateOwner and calcAccountId.
 *
 * @param orcidId An ORCID iD
 * @returns The ORCID iD prefixed with 'sandbox-' if using the sandbox API or
 *  the plain ORCID iD otherwise.
 */
export function orcidIdToSandoxOrcidId(orcidId: string) {
  if (isSandboxOrcidEnv()) {
    return `${ORCID_SANDBOX_PREFIX}${orcidId}`;
  }

  return orcidId;
}

/**
 * Return the account ID for an ORCID iD by calling calcAccountId.
 *
 * @param orcidId An ORCID iD.
 * @returns The corresponding account ID.
 */
export function orcidIdToAccountId(orcidId: string) {
  return executeRepoDriverReadMethod({
    functionName: 'calcAccountId',
    args: [Forge.orcidId, hexlify(toUtf8Bytes(orcidIdToSandoxOrcidId(orcidId))) as OxString],
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

export async function fetchOrcidAccount(orcidId: string, fetch?: typeof global.fetch) {
  const result = await query<OrcidByAccountIdQuery, OrcidByAccountIdQueryVariables>(
    getOrcidQuery,
    {
      orcid: orcidIdToSandoxOrcidId(orcidId),
      chain: network.gqlName,
    },
    fetch,
  );

  if (result.orcidLinkedIdentityByOrcid) {
    // For sandboxed ORCID iDs, strip the 'sandbox-' prefix before returning to the caller
    // for the sake of front-end continuity.
    result.orcidLinkedIdentityByOrcid.orcid = orcidId;
  }

  return result;
}

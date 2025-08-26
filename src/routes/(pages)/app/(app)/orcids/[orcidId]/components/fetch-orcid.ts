import { gql } from 'graphql-request';
import { ORCID_PROFILE_FRAGMENT } from './orcid-profile-fragments';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import type {
  OrcidByAccountIdQuery,
  OrcidByAccountIdQueryVariables,
} from './__generated__/gql.generated';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';
import { PUBLIC_ORCID_API_URL } from '$env/static/public';
import { OrcidApiResponseSchema } from '$lib/utils/orcids/schemas';
import Orcid from '$lib/utils/orcids/entities';

export function orcidIdToAccountId(orcidId: string) {
  return executeRepoDriverReadMethod({
    functionName: 'calcAccountId',
    args: [Forge.orcidId, hexlify(toUtf8Bytes(orcidId)) as OxString],
  });
}

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
  query OrcidByAccountId($accountId: ID!, $chains: [SupportedChain!]) {
    orcidAccountById(id: $accountId, chains: $chains) {
      ...OrcidProfile
    }
  }
`;

export async function fetchOrcidAccount(accountId: string, fetch: typeof global.fetch) {
  return query<OrcidByAccountIdQuery, OrcidByAccountIdQueryVariables>(
    getOrcidQuery,
    {
      accountId,
      chains: [network.gqlName],
    },
    fetch,
  );
}

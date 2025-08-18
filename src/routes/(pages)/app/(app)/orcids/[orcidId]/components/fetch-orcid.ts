import { gql } from 'graphql-request';
import { ORCID_PROFILE_FRAGMENT } from './orcid-profile.svelte';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import type {
  OrcidByAccountIdQuery,
  OrcidByAccountIdQueryVariables,
} from './__generated__/gql.generated';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';

export function orcidIdToAccountId(orcidId: string) {
  return executeRepoDriverReadMethod({
    functionName: 'calcAccountId',
    args: [Forge.orcidId, hexlify(toUtf8Bytes(orcidId)) as OxString],
  });
}

export async function fetchOrcid(orcidId: string, fetch: typeof global.fetch) {
  // TODO: his the ORCID API endpoint
  return [orcidId, fetch];
}

const getOrcidQuery = gql`
  ${ORCID_PROFILE_FRAGMENT}
  query OrcidByAccountId($accountId: ID!, $chains: [SupportedChain!]) {
    orcidAccountById(id: $accountId, chains: $chains) {
      ...OrcidProfile
    }
  }
`;

export async function fetchOrcidChainData(accountId: string, fetch: typeof global.fetch) {
  return query<OrcidByAccountIdQuery, OrcidByAccountIdQueryVariables>(
    getOrcidQuery,
    {
      accountId,
      chains: [network.gqlName],
    },
    fetch,
  );
}

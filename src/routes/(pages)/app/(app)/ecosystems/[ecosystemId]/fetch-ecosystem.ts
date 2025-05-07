import { gql } from 'graphql-request';
import { ECOSYSTEM_PROFILE_FRAGMENT } from './components/ecosystem-profile.svelte';
import network from '$lib/stores/wallet/network';
import type {
  EcosystemByAccountIdQuery,
  EcosystemByAccountIdQueryVariables,
} from './__generated__/gql.generated';
import query from '$lib/graphql/dripsQL';

export async function fetchEcosystem(accountId: string, fetch: typeof global.fetch) {
  const getEcosystemQuery = gql`
    ${ECOSYSTEM_PROFILE_FRAGMENT}
    query EcosystemByAccountId($accountId: ID!, $chain: SupportedChain!) {
      ecosystemMainAccount(id: $accountId, chain: $chain) {
        ...EcosystemProfile
      }
    }
  `;

  // TODO: cache
  return query<EcosystemByAccountIdQuery, EcosystemByAccountIdQueryVariables>(
    getEcosystemQuery,
    {
      accountId,
      chain: network.gqlName,
    },
    fetch,
  );
}
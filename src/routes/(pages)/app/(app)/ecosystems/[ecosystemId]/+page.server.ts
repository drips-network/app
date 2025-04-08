import type { PageServerLoad } from './$types';
import * as ecosystemsApi from '$lib/utils/ecosystems';
import { gql } from 'graphql-request';
import { ECOSYSTEM_PROFILE_FRAGMENT } from './components/ecosystem-profile.svelte';
import network from '$lib/stores/wallet/network';
import type {
  EcosystemByAccountIdQuery,
  EcosystemByAccountIdQueryVariables,
} from './__generated__/gql.generated';
import query from '$lib/graphql/dripsQL';
import { error } from '@sveltejs/kit';

async function fetchEcosystem(accountId: string, fetch: typeof global.fetch) {
  const getEcosystemQuery = gql`
    ${ECOSYSTEM_PROFILE_FRAGMENT}
    query EcosystemByAccountId($accountId: ID!, $chain: SupportedChain!) {
      ecosystem(id: $accountId, chain: $chain) {
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

export const load = (async ({ params, fetch }) => {
  const ecosystem = await ecosystemsApi.get(params.ecosystemId, fetch);
  let ecosystemFragment = undefined;
  if (ecosystem.accountId) {
    const ecosystemRes = await fetchEcosystem(ecosystem.accountId, fetch);
    ecosystemFragment = ecosystemRes.ecosystem;
    if (!ecosystemFragment) {
      throw error(404);
    }
  }

  return {
    ecosystem,
    ecosystemFragment,
  };
}) satisfies PageServerLoad;

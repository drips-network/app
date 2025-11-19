import { HEADER_USER_FRAGMENT } from '$lib/components/header/header.svelte';
import query from '$lib/graphql/dripsQL.js';
import { gql } from 'graphql-request';
import type { UserQuery, UserQueryVariables } from './__generated__/gql.generated';
import getConnectedAddress from '$lib/utils/get-connected-address.js';
import { browser } from '$app/environment';
import network from '$lib/stores/wallet/network';

export const load = async ({ fetch, depends }) => {
  if (!browser) return { user: null };

  const connectedAddress = getConnectedAddress();

  if (connectedAddress) {
    depends('app-layout:user');

    const user = await query<UserQuery, UserQueryVariables>(
      gql`
        ${HEADER_USER_FRAGMENT}
        query User($connectedAddress: String!, $chains: [SupportedChain!]) {
          userByAddress(address: $connectedAddress, chains: $chains) {
            ...HeaderUser
          }
        }
      `,
      { connectedAddress, chains: [network.gqlName] },
      fetch,
    );

    return { user: user.userByAddress };
  }

  return { user: null };
};

import { HEADER_USER_FRAGMENT } from '$lib/components/header/header.svelte';
import query from '$lib/graphql/dripsQL.js';
import { gql } from 'graphql-request';
import type { UserQuery, UserQueryVariables } from './__generated__/gql.generated.js';
import getConnectedAddress from '$lib/utils/get-connected-address.js';

export const load = async ({ url: { pathname }, fetch, depends }) => {
  const connectedAddress = getConnectedAddress();

  if (connectedAddress) {
    depends('app-layout:user');

    const user = await query<UserQuery, UserQueryVariables>(
      gql`
        ${HEADER_USER_FRAGMENT}
        query User($connectedAddress: String!) {
          userByAddress(address: $connectedAddress) {
            ...HeaderUser
          }
        }
      `,
      { connectedAddress },
      fetch,
    );

    return { user: user.userByAddress, pathname };
  }

  return { pathname, user: null };
};

export const ssr = false;

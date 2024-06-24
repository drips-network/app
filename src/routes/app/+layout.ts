import { HEADER_USER_FRAGMENT } from '$lib/components/header/header.svelte';
import query from '$lib/graphql/dripsQL.js';
import { gql } from 'graphql-request';
import type { UserQuery, UserQueryVariables } from './__generated__/gql.generated';
import getConnectedAddress from '$lib/utils/get-connected-address.js';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import { browser } from '$app/environment';

const fetchedDataCache = makeFetchedDataCache<UserQuery>('app-layout:user');

export const load = async ({ url: { pathname }, fetch, depends }) => {
  if (!browser) return { pathname, user: null };

  const connectedAddress = getConnectedAddress();

  if (connectedAddress) {
    depends('app-layout:user');

    const user =
      fetchedDataCache.read() ??
      (await query<UserQuery, UserQueryVariables>(
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
      ));

    fetchedDataCache.write(user);

    return { user: user.userByAddress, pathname };
  }

  return { pathname, user: null };
};

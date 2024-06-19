import { gql } from 'graphql-request';
import {
  TOKEN_PAGE_USER_BALANCES_FRAGMENT,
  TOKEN_PAGE_USER_STREAMS_FRAGMENT,
} from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { TokenPageQuery, TokenPageQueryVariables } from './__generated__/gql.generated';
import { error, redirect } from '@sveltejs/kit';
import { isAddress } from 'ethers/lib/utils';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';

export const load = async ({ fetch, params }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    throw redirect(307, buildUrl('/app/connect', { backTo: `/app/tokens/${params.token}` }));
  }

  if (!isAddress(params.token)) {
    throw error(404);
  }

  const tokenPageQuery = gql`
    ${TOKEN_PAGE_USER_BALANCES_FRAGMENT}
    ${TOKEN_PAGE_USER_STREAMS_FRAGMENT}
    query TokenPage($address: String!) {
      userByAddress(address: $address) {
        balances {
          ...TokenPageUserBalances
        }
        streams {
          ...TokenPageUserStreams
        }
      }
    }
  `;

  const res = await query<TokenPageQuery, TokenPageQueryVariables>(
    tokenPageQuery,
    { address: connectedAddress },
    fetch,
  );

  return {
    balances: res.userByAddress.balances,
    streams: res.userByAddress.streams,
  };
};

export const ssr = false;

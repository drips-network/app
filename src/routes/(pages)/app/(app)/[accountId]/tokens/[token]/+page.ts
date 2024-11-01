import { gql } from 'graphql-request';
import {
  TOKEN_PAGE_USER_BALANCES_FRAGMENT,
  TOKEN_PAGE_USER_STREAMS_FRAGMENT,
} from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { TokenPageQuery, TokenPageQueryVariables } from './__generated__/gql.generated';
import { error, redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { isAddress } from 'ethers';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import network from '$lib/stores/wallet/network';

export const load = async ({ fetch, params }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: `/app/tokens/${params.token}` }));
  }

  if (!isAddress(params.token)) {
    error(404);
  }

  const tokenPageQuery = gql`
    ${TOKEN_PAGE_USER_BALANCES_FRAGMENT}
    ${TOKEN_PAGE_USER_STREAMS_FRAGMENT}
    query TokenPage($address: String!, $chains: [SupportedChain!]) {
      userByAddress(address: $address, chains: $chains) {
        chainData {
          chain
          balances {
            ...TokenPageUserBalances
          }
          streams {
            ...TokenPageUserStreams
          }
        }
      }
    }
  `;

  const res = await query<TokenPageQuery, TokenPageQueryVariables>(
    tokenPageQuery,
    { address: connectedAddress, chains: [network.gqlName] },
    fetch,
  );

  const chainData = filterCurrentChainData(res.userByAddress.chainData);

  return {
    balances: chainData.balances,
    streams: chainData.streams,
  };
};

export const ssr = false;

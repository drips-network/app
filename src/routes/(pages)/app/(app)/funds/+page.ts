import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from './sections/streams.section.svelte';
import query from '$lib/graphql/dripsQL';
import { redirect } from '@sveltejs/kit';
import { USER_BALANCES_FRAGMENT } from './sections/balances.section.svelte';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import type { UserStreamsQuery, UserStreamsQueryVariables } from './__generated__/gql.generated';
import network from '$lib/stores/wallet/network';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';

const fetchedDataCache = makeFetchedDataCache<UserStreamsQuery>('dashboard:funds');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/funds' }));
  }

  const streamsQuery = gql`
    ${STREAMS_SECTION_STREAMS_FRAGMENT}
    ${USER_BALANCES_FRAGMENT}
    query UserStreams($connectedAddress: String!, $chains: [SupportedChain!]!) {
      userByAddress(address: $connectedAddress, chains: $chains) {
        chainData {
          chain
          streams {
            ...StreamsSectionStreams
          }
          balances {
            ...UserBalances
          }
        }
      }
    }
  `;

  const res =
    fetchedDataCache.read() ??
    (await query<UserStreamsQuery, UserStreamsQueryVariables>(
      streamsQuery,
      {
        connectedAddress,
        chains: [network.gqlName],
      },
      fetch,
    ));

  fetchedDataCache.write(res);

  const chainData = filterCurrentChainData(res.userByAddress.chainData);

  return {
    streams: chainData.streams,
    balances: chainData.balances,
    blockWhileInitializing: false,
  };
};

export const ssr = false;

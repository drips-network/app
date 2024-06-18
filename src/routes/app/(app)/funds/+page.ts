import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from './sections/streams.section.svelte';
import query from '$lib/graphql/dripsQL';
import type { UserStreamsQuery, UserStreamsQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import { USER_BALANCES_FRAGMENT } from './sections/balances.section.svelte';
import buildUrl from '$lib/utils/build-url';
import getCookieClientSide from '$lib/utils/get-cookie-clientside';

export const load = async ({ fetch }) => {
  const connectedAddress = getCookieClientSide('connected-address');

  if (!connectedAddress) {
    throw redirect(307, buildUrl('/app/connect', { backTo: '/app/funds' }));
  }

  const streamsQuery = gql`
    ${STREAMS_SECTION_STREAMS_FRAGMENT}
    ${USER_BALANCES_FRAGMENT}
    query UserStreams($connectedAddress: String!) {
      userByAddress(address: $connectedAddress) {
        streams {
          ...StreamsSectionStreams
        }
        balances {
          ...UserBalances
        }
      }
    }
  `;

  const res = await query<UserStreamsQuery, UserStreamsQueryVariables>(
    streamsQuery,
    {
      connectedAddress,
    },
    fetch,
  );

  return {
    streams: res.userByAddress.streams,
    balances: res.userByAddress.balances,
  };
};

export const ssr = false;

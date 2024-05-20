import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from './sections/streams.section.svelte';
import query from '$lib/graphql/dripsQL';
import type { UserStreamsQuery, UserStreamsQueryVariables } from './__generated__/gql.generated';
import { error } from '@sveltejs/kit';
import { USER_BALANCES_FRAGMENT } from './sections/balances.section.svelte';

export const load = async ({ fetch, cookies }) => {
  const connectedAddress = cookies.get('connected-address');

  if (!connectedAddress) {
    return error(401, 'Unauthorized');
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

  const res = await query<UserStreamsQuery, UserStreamsQueryVariables>(streamsQuery, {
  connectedAddress,
  }, fetch);

  return {
    streams: res.userByAddress.streams,
    balances: res.userByAddress.balances,
  };
};

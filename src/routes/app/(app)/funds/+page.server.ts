import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from './sections/streams.section.svelte';
import query from '$lib/graphql/dripsQL';
import type { UserStreamsQuery, UserStreamsQueryVariables } from './__generated__/gql.generated';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch, cookies }) => {
  const connectedAddress = cookies.get('connected-address');

  if (!connectedAddress) {
    return error(401, 'Unauthorized');
  }
  
  const streamsQuery = gql`
    ${STREAMS_SECTION_STREAMS_FRAGMENT}
    query UserStreams($connectedAddress: String!) {
      userByAddress(address: $connectedAddress) {
        streams {
          ...StreamsSectionStreams
        }
      }
    }
  `;

  const res = await query<UserStreamsQuery, UserStreamsQueryVariables>(streamsQuery, {
  connectedAddress,
  }, fetch);

  const streams = res.userByAddress.streams;

  return {
    streams,
  };
};

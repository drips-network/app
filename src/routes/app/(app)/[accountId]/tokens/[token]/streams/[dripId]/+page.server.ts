import decodeUniversalAccountId from '$lib/utils/decode-universal-account-id.js';
import { error } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { STREAM_PAGE_STREAM_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { StreamPageQuery, StreamPageQueryVariables } from './__generated__/gql.generated';
import makeStreamId from '$lib/utils/streams/make-stream-id';
import network from '$lib/stores/wallet/network';

export const load = async ({ params, fetch }) => {
  const { accountId, token, dripId } = params;

  const decodedId = await decodeUniversalAccountId(accountId);

  if (decodedId.driver !== 'address') {
    error(404);
  }

  const streamPageQuery = gql`
    ${STREAM_PAGE_STREAM_FRAGMENT}
    query StreamPage($senderAccountId: ID!, $chains: [SupportedChain!]) {
      streams(chains: $chains, where: { senderId: $senderAccountId }) {
        ...StreamPageStream
        id
      }
    }
  `;

  const res = await query<StreamPageQuery, StreamPageQueryVariables>(
    streamPageQuery,
    {
      senderAccountId: decodedId.dripsAccountId,
      chains: [network.gqlName],
    },
    fetch,
  );

  const matchingStream = res.streams.find(
    (stream) => stream.id.toLowerCase() === makeStreamId(decodedId.dripsAccountId, token, dripId),
  );

  if (!matchingStream) {
    error(404);
  }

  return { stream: matchingStream, blockWhileInitializing: false };
};

import decodeUniversalAccountId from '$lib/utils/decode-universal-account-id.js';
import { error } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { STREAM_PAGE_STREAM_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { StreamPageQuery, StreamPageQueryVariables } from './__generated__/gql.generated';
import makeStreamId from '$lib/stores/streams/methods/make-stream-id';

export const load = async ({ params, fetch }) => {
  const { accountId, token, dripId } = params;

  const decodedId = await decodeUniversalAccountId(accountId);

  if (decodedId.driver !== 'address') {
    throw error(404);
  }

  const streamPageQuery = gql`
    ${STREAM_PAGE_STREAM_FRAGMENT}
    query StreamPage($senderAccountId: ID!) {
      streams(where: { senderId: $senderAccountId }) {
        ...StreamPageStream
        id
      }
    }
  `;

  const res = await query<StreamPageQuery, StreamPageQueryVariables>(streamPageQuery, {
    senderAccountId: decodedId.dripsAccountId,
  }, fetch);

  const matchingStream = res.streams.find((stream) => stream.id === makeStreamId(
    decodedId.dripsAccountId,
    token,
    dripId,
  )); 

  if (!matchingStream) {
    throw error(404);
  }

  return { stream: matchingStream, blockWhileInitializing: false }
};

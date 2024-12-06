import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { TestQuery, TestQueryVariables } from './__generated__/gql.generated';
import { error } from '@sveltejs/kit';

export const GET = async () => {
  // simple ping endpoint for downtime-less deploys. railway will hit this and wait for 200
  // before directing traffic to a newly built container
  // checks whether the API can be reached. This is important because private IPV6 networking
  // in Railway needs a few seconds to start up after a deploy

  const testQuery = gql`
    query Test {
      __typename
    }
  `;

  try {
    await query<TestQuery, TestQueryVariables>(testQuery);
    return new Response('OK');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Health endpoint error', e);
    return error(500);
  }
};

import uniqBy from 'lodash/uniqBy';
import { parse } from 'graphql';
import { GraphQLClient, type RequestDocument, type Variables } from 'graphql-request';
import { addTypenameToDocument } from '@apollo/client/utilities';
import { BASE_URL } from '$lib/utils/base-url';
import { browser, dev } from '$app/environment';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

const PORT = getOptionalEnvVar('PUBLIC_PORT', false, null);

export default async function query<TResponse, TVariables extends Variables = Variables>(
  query: RequestDocument,
  variables?: TVariables,
  customFetch: typeof fetch = fetch,
): Promise<TResponse> {
  // We proxy client-side requests through an endpoint on this sveltekit app in order to
  // inject the Authorization header.
  // If we're currently in a browser or dev mode, we use the app's base URL to construct the endpoint.
  // If we're on the server in prod, we use localhost in order for traffic to stay within the container
  // and avoid network overhead.
  // IMPORTANT: This assumes the app is running on port 8080 in the container, which should usually be the case.
  const endpointLocation =
    browser || dev ? `${BASE_URL}/api/gql` : `http://localhost:${PORT ?? '8080'}/api/gql`;

  const client = new GraphQLClient(endpointLocation, {
    fetch: customFetch,
  });

  const parsedQuery = typeof query === 'string' ? parse(query) : query;

  const queryWithTypenames = addTypenameToDocument(parsedQuery);

  return await client.request<TResponse>(
    { ...queryWithTypenames, definitions: uniqBy(queryWithTypenames.definitions, 'name.value') },
    variables,
  );
}

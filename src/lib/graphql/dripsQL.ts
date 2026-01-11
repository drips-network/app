import uniqBy from 'lodash/uniqBy';
import { parse } from 'graphql';
import { GraphQLClient, type RequestDocument, type Variables } from 'graphql-request';
import { addTypenameToDocument } from '@apollo/client/utilities';
import { PUBLIC_GQL_URL, PUBLIC_INTERNAL_GQL_URL } from '$env/static/public';
import { browser } from '$app/environment';

export default async function query<TResponse, TVariables extends Variables = Variables>(
  query: RequestDocument,
  variables?: TVariables,
  customFetch: typeof fetch = fetch,
): Promise<TResponse> {
  const url = browser ? PUBLIC_GQL_URL : PUBLIC_INTERNAL_GQL_URL;
  const client = new GraphQLClient(url, {
    fetch: customFetch,
  });

  const parsedQuery = typeof query === 'string' ? parse(query) : query;

  const queryWithTypenames = addTypenameToDocument(parsedQuery);

  return await client.request<TResponse>(
    { ...queryWithTypenames, definitions: uniqBy(queryWithTypenames.definitions, 'name.value') },
    variables,
  );
}

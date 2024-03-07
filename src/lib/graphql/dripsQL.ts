import uniqBy from 'lodash/uniqBy';
import { addTypenameToDocument } from 'apollo-utilities';
import { parse } from 'graphql';
import { GraphQLClient, type RequestDocument, type Variables } from 'graphql-request';

export default async function query<TResponse, TVariables extends Variables = Variables>(
  query: RequestDocument,
  variables?: TVariables,
  customFetch: typeof fetch = fetch,
  cache = false,
): Promise<TResponse> {
  const client = new GraphQLClient('/api/gql', {
    fetch: customFetch,
    headers: {
      'X-Cache': cache ? 'Yes' : 'No',
    },
  });

  const parsedQuery = typeof query === 'string' ? parse(query) : query;

  const queryWithTypenames = addTypenameToDocument(parsedQuery);

  return await client.request<TResponse>(
    { ...queryWithTypenames, definitions: uniqBy(queryWithTypenames.definitions, 'name.value') },
    variables,
  );
}

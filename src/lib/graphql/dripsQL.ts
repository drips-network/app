import {
  ApolloClient,
  InMemoryCache,
  type DocumentNode,
  type OperationVariables,
} from '@apollo/client';

const DRIPS_GRAPHQL_URL = 'https://drips-api.ey.r.appspot.com/';
const client = new ApolloClient({
  uri: DRIPS_GRAPHQL_URL,
  cache: new InMemoryCache(),
});
export default async function query<
  TResponse,
  TOperationVariables extends OperationVariables = OperationVariables,
>(query: DocumentNode, variables?: TOperationVariables): Promise<TResponse> {
  const { data } = await client.query<TResponse>({
    query,
    variables,
  });
  return data;
}
